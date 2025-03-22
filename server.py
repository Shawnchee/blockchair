from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import spacy
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from supabase import create_client
import os
from dotenv import load_dotenv
from supabase import create_client
from pathlib import Path

# Load .env variables
env_path = Path(__file__).resolve().parent / ".env.local"
load_dotenv(dotenv_path=env_path)

# Get from environment
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Define the response models
class CharityMatch(BaseModel):
    match_type: str = Field(..., description="How this charity matched (category, description, or both)")
    match_strength: float = Field(..., description="Strength of the match (0-1)")

class Charity(BaseModel):
    charityId: int
    name: str
    description: str
    focus_areas: List[str] = Field(default_factory=list)
    relevance_score: float
    match_details: CharityMatch

# Initialize FastAPI app
app = FastAPI(
    title="Advanced Charity Recommendation API",
    description="Enhanced API for precise charity recommendations based on user interests",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load and preprocess data only once at startup
print("Loading and preprocessing data...")
# With this:
print("Fetching data from Supabase...")
try:
    # Query all data from the charity_donor table
    response = supabase.table("charity_donor").select("*").execute()
    
    # Convert the response data to a DataFrame
    df = pd.DataFrame(response.data)
    
    print(f"Successfully loaded {len(df)} records from Supabase")
except Exception as e:
    print(f"Error fetching data from Supabase: {e}")
    # Provide an empty DataFrame as fallback
    df = pd.DataFrame(columns=["charityId", "name", "description", "focusAreas"])

# Clean and preprocess the data
df['processed_description'] = df['description'].fillna('').astype(str)
df['focusAreas'] = df['focusAreas'].fillna('').astype(str)

# Split focus areas into lists for better matching
df['focus_areas_list'] = df['focusAreas'].apply(lambda x: [area.strip() for area in x.split(',') if area.strip()])

# Create a lookup dictionary for faster access - convert to dictionary properly
charity_lookup = {}
for _, row in df.iterrows():
    charity_id = row['charityId']
    # Convert row to a dictionary
    charity_lookup[charity_id] = {
        'charityId': charity_id,
        'name': row['name'],
        'description': row['description'],
        'focus_areas_list': row['focus_areas_list'],
        'focusAreas': row['focusAreas']
    }

# Download and load the trained model from Supabase
print("Downloading model from Supabase...")
bucket_name = "ml-pickle"
file_name = "charity_model.pkl"
try:
    response = supabase.storage.from_(bucket_name).download(file_name)
    with open(file_name, "wb") as f:
        f.write(response)
    with open(file_name, "rb") as f:
        best_model = pickle.load(f)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model from Supabase: {e}")
    best_model = None

# Load spaCy model - use a smaller model if possible
print("Loading NLP model...")
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback to a simpler model
    nlp = spacy.blank("en")
    print("Using blank model as fallback")

# Initialize TF-IDF vectorizer and fit it only once
print("Preparing text vectorizer...")
tfidf_vectorizer = TfidfVectorizer(
    min_df=2,
    max_df=0.95,
    max_features=5000,  # Reduced from 10000
    strip_accents='unicode',
    analyzer='word',
    token_pattern=r'\w{1,}',
    ngram_range=(1, 2),  # Reduced from (1, 3) to (1, 2)
    stop_words='english'
)

# Create combined text for better matching (description + focus areas)
df['combined_text'] = df['processed_description'] + ' ' + df['focusAreas']

# Fit vectorizer on combined text
text_matrix = tfidf_vectorizer.fit_transform(df['combined_text'])

# Create a focus areas index for faster matching
focus_area_index = {}
for idx, row in df.iterrows():
    for area in row['focus_areas_list']:
        area_lower = area.lower()
        if area_lower not in focus_area_index:
            focus_area_index[area_lower] = []
        focus_area_index[area_lower].append((row['charityId'], idx))

print("API startup complete")

# Function to preprocess query - cached for performance
query_cache = {}
def preprocess_query(text):
    # Check cache first
    if text in query_cache:
        return query_cache[text]
    
    doc = nlp(text.lower())
    
    # Extract main entities and concepts
    entities = [ent.text for ent in doc.ents]
    
    # Extract keywords (nouns, proper nouns, verbs, adjectives)
    keywords = [token.lemma_ for token in doc if token.pos_ in ["NOUN", "PROPN", "VERB", "ADJ"] and not token.is_stop]
    
    # Combine entities and keywords
    all_terms = entities + keywords
    
    # Prepare result
    result = {
        "original": text,
        "processed": " ".join(keywords),
        "expanded": " ".join(all_terms),
        "keywords": keywords,
        "entities": entities
    }
    
    # Cache the result
    query_cache[text] = result
    return result

# Function to get semantic similarity - optimized
def get_semantic_similarity(query_info, top_n=15):
    # Use the expanded query for better matching
    query_vector = tfidf_vectorizer.transform([query_info["expanded"]])
    
    # Calculate cosine similarity
    similarity_scores = cosine_similarity(query_vector, text_matrix).flatten()
    
    # Get indices of top matches more efficiently
    top_indices = np.argsort(similarity_scores)[-top_n:][::-1]
    
    return [(df.iloc[idx]['charityId'], similarity_scores[idx]) for idx in top_indices if similarity_scores[idx] > 0.01]

# Function to match focus areas - optimized with index
def match_focus_areas(query_info):
    matches = {}
    
    # Check each keyword against focus areas
    for keyword in query_info["keywords"] + query_info["entities"]:
        keyword_lower = keyword.lower()
        
        # Exact match lookup
        if keyword_lower in focus_area_index:
            for charity_id, _ in focus_area_index[keyword_lower]:
                matches[charity_id] = matches.get(charity_id, 0) + 1
        
        # Partial match lookup (more expensive)
        else:
            for focus_area in focus_area_index:
                if keyword_lower in focus_area:
                    for charity_id, _ in focus_area_index[focus_area]:
                        matches[charity_id] = matches.get(charity_id, 0) + 0.5
    
    # Normalize scores
    max_score = max(matches.values()) if matches else 1
    return [(charity_id, score/max_score) for charity_id, score in matches.items()]

# Advanced prediction function - optimized
def predict_charities(user_input, top_n=5):
    # Preprocess the query
    query_info = preprocess_query(user_input)
    
    # Get semantic similarity matches
    semantic_matches = get_semantic_similarity(query_info)
    semantic_charity_ids = {charity_id: score for charity_id, score in semantic_matches}
    
    # Get focus area matches
    focus_matches = match_focus_areas(query_info)
    focus_charity_ids = {charity_id: score for charity_id, score in focus_matches}
    
    # Combine all matching charity IDs
    all_charity_ids = set(semantic_charity_ids.keys()).union(set(focus_charity_ids.keys()))
    
    if not all_charity_ids:
        return []

    # Calculate final scores and prepare results
    final_recommendations = []
    for charity_id in all_charity_ids:
        # Faster lookup using our prebuilt dictionary
        if charity_id not in charity_lookup:
            continue
            
        charity_info = charity_lookup[charity_id]
            
        # Get model prediction score (if available)
        try:
            model_score = best_model.predict(1, charity_id).est
        except:
            model_score = 0.5  # Default score
        
        # Get semantic similarity score (if available)
        semantic_score = semantic_charity_ids.get(charity_id, 0)
        
        # Get focus area match score (if available)
        focus_score = focus_charity_ids.get(charity_id, 0)
        
        # Determine match type
        if semantic_score > 0 and focus_score > 0:
            match_type = "both"
            match_strength = max(semantic_score, focus_score)
        elif semantic_score > 0:
            match_type = "description"
            match_strength = semantic_score
        else:
            match_type = "category"
            match_strength = focus_score
        
        # Calculate combined relevance score
        # Weight: 40% model, 30% semantic, 30% focus area
        relevance = (model_score * 0.4) + (semantic_score * 0.3) + (focus_score * 0.3)
        
        # Create recommendation object
        recommendation = {
            "charityId": int(charity_info["charityId"]),
            "name": charity_info["name"],
            "description": charity_info["description"],
            "focus_areas": charity_info["focus_areas_list"],
            "relevance_score": float(relevance),
            "match_details": {
                "match_type": match_type,
                "match_strength": float(match_strength)
            }
        }
        
        final_recommendations.append(recommendation)
    
    # Sort by relevance score and return top N
    final_recommendations.sort(key=lambda x: x["relevance_score"], reverse=True)
    return final_recommendations[:top_n]

# API Endpoint: Predict Charities
@app.get("/predict", response_model=List[Charity], summary="Get charity recommendations")
async def predict(query: str = Query(..., description="The cause or interest")):

    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")
    
    try:    
        recommendations = predict_charities(query, top_n=5)
        
        if not recommendations:
            return []
            
        return recommendations
    except Exception as e:
        # Log the error for debugging
        print(f"Error processing query '{query}': {str(e)}")
        # Return a helpful error message
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

# Health check endpoint
@app.get("/health", summary="Health check endpoint")
async def health_check():
    """Simple health check endpoint to verify the API is running."""
    return {"status": "healthy", "loaded_charities": len(df)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=5000, reload=False)  # Disabled reload for production