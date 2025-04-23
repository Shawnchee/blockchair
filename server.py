from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import spacy
import re
import math
import Levenshtein
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
    semantic_score: float = Field(default=0.0, description="Semantic similarity score (0-1)")
    focus_score: float = Field(default=0.0, description="Focus area match score (0-1)")
    model_score: float = Field(default=0.5, description="Model prediction score (0-1)")

class Charity(BaseModel):
    charityId: int
    name: str
    description: str
    focus_areas: List[str] = Field(default_factory=list)
    relevance_score: float
    match_details: CharityMatch
    website: Optional[str] = Field(None, description="Charity website URL")

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

    # Also try to fetch data from the charity table which might have website URLs
    try:
        charity_response = supabase.table("charity").select("*").execute()
        charity_df = pd.DataFrame(charity_response.data)

        # If we have charity data, merge it with our main dataframe
        if not charity_df.empty and 'id' in charity_df.columns:
            # Rename id to charityId for consistency
            charity_df = charity_df.rename(columns={'id': 'charityId'})

            # Merge the dataframes, keeping all rows from df
            if 'charityId' in df.columns:
                df = pd.merge(df, charity_df[['charityId', 'website']], on='charityId', how='left')
    except Exception as e:
        print(f"Error fetching charity data: {e}")

    # Also try to fetch data from the charity_2 table which might have website URLs
    try:
        charity2_response = supabase.table("charity_2").select("*").execute()
        charity2_df = pd.DataFrame(charity2_response.data)

        # If we have charity_2 data, merge it with our main dataframe
        if not charity2_df.empty and 'id' in charity2_df.columns:
            # Rename columns for consistency
            charity2_df = charity2_df.rename(columns={'id': 'charityId', 'websiteurl': 'website'})

            # Merge the dataframes, keeping all rows from df
            if 'charityId' in df.columns:
                # Only merge the website column if it exists
                if 'website' in charity2_df.columns:
                    df = pd.merge(df, charity2_df[['charityId', 'website']], on='charityId', how='left')
                # If websiteurl exists instead of website
                elif 'websiteurl' in charity2_df.columns:
                    charity2_df = charity2_df.rename(columns={'websiteurl': 'website'})
                    df = pd.merge(df, charity2_df[['charityId', 'website']], on='charityId', how='left')
    except Exception as e:
        print(f"Error fetching charity_2 data: {e}")

    print(f"Successfully loaded {len(df)} records from Supabase")
except Exception as e:
    print(f"Error fetching data from Supabase: {e}")
    # Provide an empty DataFrame as fallback
    df = pd.DataFrame(columns=["charityId", "name", "description", "focusAreas", "website"])

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
        'focusAreas': row['focusAreas'],
        'website': row.get('website', None)  # Include website URL if available
    }

# Download and load the trained model from Supabase
print("Downloading model from Supabase...")
bucket_name = "ml-pickle"
file_name = "charity_model.pkl"
best_model = None

try:
    # Create a models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    model_path = os.path.join('models', file_name)

    # Try to load from local cache first
    if os.path.exists(model_path):
        print("Loading model from local cache...")
        with open(model_path, 'rb') as f:
            best_model = pickle.load(f)
        print("Model loaded successfully from cache!")
    else:
        print("Downloading model from Supabase...")
        try:
            response = supabase.storage.from_(bucket_name).download(file_name)
            with open(model_path, 'wb') as f:
                f.write(response)
            with open(model_path, 'rb') as f:
                best_model = pickle.load(f)
            print("Model downloaded and loaded successfully!")
        except Exception as e:
            print(f"Error downloading model from Supabase: {e}")
            best_model = None

except Exception as e:
    print(f"Error handling model: {e}")
    best_model = None

# Load spaCy model - use a more comprehensive model for better entity recognition and linguistic features
print("Loading NLP model...")
try:
    # Try to load the medium model first for better accuracy
    try:
        nlp = spacy.load("en_core_web_md")
        print("Using enhanced medium-sized NLP model with word vectors")
    except:
        # Fall back to small model if medium is not available
        nlp = spacy.load("en_core_web_sm")
        print("Using small NLP model")

    # Add custom components to the pipeline
    # Add sentence segmentation for better context understanding
    if "sentencizer" not in nlp.pipe_names:
        from spacy.pipeline import Sentencizer
        nlp.add_pipe("sentencizer")

    # Add custom charity-specific entity types if not already in the model
    if "entity_ruler" not in nlp.pipe_names:
        from spacy.pipeline import EntityRuler
        ruler = nlp.add_pipe("entity_ruler")

        # Add charity-specific patterns
        patterns = [
            {"label": "CHARITY_TYPE", "pattern": [{"LOWER": "nonprofit"}]},
            {"label": "CHARITY_TYPE", "pattern": [{"LOWER": "non"}, {"LOWER": "profit"}]},
            {"label": "CHARITY_TYPE", "pattern": [{"LOWER": "ngo"}]},
            {"label": "CHARITY_TYPE", "pattern": [{"LOWER": "foundation"}]},
            {"label": "CHARITY_TYPE", "pattern": [{"LOWER": "charity"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "education"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "health"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "environment"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "poverty"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "children"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "animal"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "wildlife"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "disaster"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "humanitarian"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "rights"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "community"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "development"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "research"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "medical"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "relief"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "support"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "aid"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "assistance"}]},
            {"label": "CHARITY_FOCUS", "pattern": [{"LOWER": "care"}]}
        ]
        ruler.add_patterns(patterns)
        print("Added charity-specific entity patterns")

except Exception as e:
    # Fallback to a simpler model
    nlp = spacy.blank("en")
    print(f"Using blank model as fallback due to error: {e}")

# Initialize TF-IDF vectorizer and fit it only once
print("Preparing text vectorizer...")
tfidf_vectorizer = TfidfVectorizer(
    min_df=1,  # Changed from 2 to 1 to include more rare terms
    max_df=0.9,  # Reduced from 0.95 to 0.9 to filter out more common terms
    max_features=8000,  # Increased from 5000 to 8000 for better coverage
    strip_accents='unicode',
    analyzer='word',
    token_pattern=r'\w{2,}',  # Changed to require at least 2 characters
    ngram_range=(1, 3),  # Increased back to (1, 3) for better phrase matching
    stop_words='english',
    use_idf=True,  # Explicitly enable IDF weighting
    smooth_idf=True,  # Apply smoothing to IDF weights
    sublinear_tf=True  # Apply sublinear tf scaling (log scaling)
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

# Function to preprocess query - enhanced with advanced NLP techniques
query_cache = {}

# Define charity-specific synonyms for better matching
charity_synonyms = {
    "kids": ["children", "youth", "young people"],
    "environment": ["environmental", "conservation", "ecological", "nature", "climate"],
    "animals": ["animal welfare", "wildlife", "pets", "conservation"],
    "education": ["educational", "learning", "school", "teaching", "academic"],
    "health": ["healthcare", "medical", "wellness", "disease", "treatment"],
    "poverty": ["poor", "homeless", "hunger", "economic development"],
    "disaster": ["emergency", "crisis", "relief", "humanitarian"],
    "rights": ["human rights", "civil rights", "advocacy", "justice"],
    "research": ["scientific", "study", "investigation", "development"],
    "community": ["local", "neighborhood", "social", "society"],
    "veterans": ["military", "soldiers", "armed forces", "service members"],
    "elderly": ["seniors", "aging", "older adults", "retirement"],
    "women": ["gender equality", "girls", "female", "maternal"],
    "refugees": ["asylum seekers", "displaced persons", "migrants"],
    "arts": ["culture", "music", "theater", "creative", "artistic"],
    "religion": ["faith", "spiritual", "church", "worship"],
    "international": ["global", "worldwide", "foreign", "developing countries"],
    "water": ["sanitation", "clean water", "hygiene", "drinking water"],
    "food": ["hunger", "nutrition", "meals", "feeding"],
    "housing": ["shelter", "homes", "homelessness", "affordable housing"]
}

def preprocess_query(text):
    # Check cache first
    if text in query_cache:
        return query_cache[text]

    # Normalize text - lowercase and strip extra whitespace
    normalized_text = " ".join(text.lower().split())

    # Process with spaCy for linguistic analysis
    doc = nlp(normalized_text)

    # Extract main entities and concepts with their labels
    entities = []
    charity_entities = []

    # Process standard entities
    for ent in doc.ents:
        entities.append(ent.text.lower())

        # Add entity label as a separate term if it's a relevant category
        if ent.label_ in ["ORG", "PERSON", "GPE", "LOC", "NORP"]:
            entities.append(ent.label_.lower())

        # Special handling for charity-specific entities
        if ent.label_ in ["CHARITY_TYPE", "CHARITY_FOCUS"]:
            charity_entities.append(ent.text.lower())
            # Add the entity label as a context signal
            charity_entities.append(ent.label_.lower())

    # Extract keywords with more specific POS filtering
    keywords = []
    important_keywords = []

    # Process each token for keywords
    for token in doc:
        # Only include meaningful parts of speech and filter out stop words
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and len(token.text) > 1:
            # Add lemmatized form for better matching
            lemma = token.lemma_.lower()
            keywords.append(lemma)

            # Check if this is a charity-related term
            if lemma in charity_synonyms:
                important_keywords.append(lemma)
                # Add all synonyms for this term
                important_keywords.extend(charity_synonyms[lemma])

            # For compound nouns, also add the full noun phrase
            if token.dep_ == "compound":
                head = token.head
                if head.pos_ == "NOUN":
                    compound = f"{lemma}_{head.lemma_.lower()}"
                    keywords.append(compound)

        # Also include important adjectives and verbs
        elif token.pos_ in ["ADJ", "VERB"] and not token.is_stop and len(token.text) > 2:
            # Only include adjectives and verbs that might be relevant to charity domains
            lemma = token.lemma_.lower()
            if any(lemma in syn_list for syn_list in charity_synonyms.values()):
                keywords.append(lemma)

    # Add noun chunks (noun phrases) for better phrase matching
    noun_chunks = []
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) > 1:
            chunk_text = chunk.text.lower()
            noun_chunks.append(chunk_text)

            # Check for charity-related phrases
            for key, synonyms in charity_synonyms.items():
                if key in chunk_text or any(syn in chunk_text for syn in synonyms):
                    important_keywords.append(chunk_text)

    # Extract contextual information from sentences
    contextual_info = []
    for sent in doc.sents:
        # Look for patterns that indicate charity interests
        sent_text = sent.text.lower()

        # Check for phrases like "I want to help...", "I care about...", etc.
        interest_patterns = ["want to help", "care about", "interested in", "support for", "donate to"]
        for pattern in interest_patterns:
            if pattern in sent_text:
                contextual_info.append(pattern)
                # Get the object of interest if possible
                for token in sent:
                    if token.dep_ in ["dobj", "pobj"] and not token.is_stop:
                        contextual_info.append(token.lemma_.lower())

    # Combine all extracted terms with appropriate weighting
    # Important keywords and charity entities get repeated for higher weight
    all_terms = entities + keywords + noun_chunks + contextual_info + important_keywords * 2 + charity_entities * 3

    # Remove duplicates while preserving order
    unique_terms = []
    for term in all_terms:
        if term not in unique_terms:
            unique_terms.append(term)

    # Prepare result with enhanced fields
    result = {
        "original": text,
        "processed": " ".join(keywords),
        "expanded": " ".join(unique_terms),
        "keywords": keywords,
        "entities": entities,
        "noun_chunks": noun_chunks,
        "charity_entities": charity_entities,
        "important_keywords": important_keywords,
        "contextual_info": contextual_info
    }

    # Cache the result
    query_cache[text] = result
    return result

# Function to get semantic similarity with advanced techniques
def get_semantic_similarity(query_info, top_n=25):  # Increased to 25 for better recall
    # Create multiple query representations for better matching
    query_representations = [
        query_info["expanded"],  # Full expanded query with all terms
        query_info["processed"],  # Just the keywords
        query_info["original"],  # Original query text
    ]

    # Add specialized representations for better matching
    specialized_representations = []

    # Add noun chunks as a separate query if available
    if "noun_chunks" in query_info and query_info["noun_chunks"]:
        specialized_representations.append(" ".join(query_info["noun_chunks"]))

    # Add important charity-related keywords if available
    if "important_keywords" in query_info and query_info["important_keywords"]:
        specialized_representations.append(" ".join(query_info["important_keywords"]))

    # Add charity-specific entities if available
    if "charity_entities" in query_info and query_info["charity_entities"]:
        specialized_representations.append(" ".join(query_info["charity_entities"]))

    # Add contextual information if available
    if "contextual_info" in query_info and query_info["contextual_info"]:
        specialized_representations.append(" ".join(query_info["contextual_info"]))

    # Combine all representations
    all_representations = query_representations + specialized_representations

    # Transform all query representations
    query_vectors = tfidf_vectorizer.transform(all_representations)

    # Calculate cosine similarity for each representation
    all_scores = []

    # Define weights for different representation types
    representation_weights = {
        0: 1.0,  # expanded - base weight
        1: 0.9,  # processed
        2: 0.8,  # original
        3: 1.1,  # noun_chunks
        4: 1.3,  # important_keywords
        5: 1.4,  # charity_entities
        6: 1.2   # contextual_info
    }

    # Calculate similarity scores for each representation
    for i, query_vector in enumerate(query_vectors):
        # Calculate similarity
        sim_scores = cosine_similarity(query_vector, text_matrix).flatten()

        # Apply weight based on representation type
        weight = representation_weights.get(i, 1.0)
        all_scores.append(sim_scores * weight)

    # Combine scores using a weighted average approach
    # This gives better results than just taking the maximum
    combined_scores = np.zeros(len(df))

    # First pass: take the maximum score for each charity
    for scores in all_scores:
        combined_scores = np.maximum(combined_scores, scores)

    # Second pass: boost scores that appear in multiple representations
    # This rewards charities that match across different aspects of the query
    boost_scores = np.zeros(len(df))
    for scores in all_scores:
        # Only count scores above a minimum threshold
        boost_scores += (scores > 0.01).astype(float) * 0.05

    # Apply the boost (capped at 30% increase)
    boost_factor = np.minimum(boost_scores, 0.3)
    final_scores = combined_scores * (1 + boost_factor)

    # Get indices of top matches
    top_indices = np.argsort(final_scores)[-top_n:][::-1]

    # Return results with a lower threshold for better recall
    return [(df.iloc[idx]['charityId'], final_scores[idx]) for idx in top_indices if final_scores[idx] > 0.003]

# Function to match focus areas with advanced fuzzy matching
def match_focus_areas(query_info):
    matches = {}

    # Prepare all terms to check with appropriate weighting
    weighted_terms = []

    # Add standard keywords (base weight)
    for term in query_info["keywords"]:
        weighted_terms.append((term.lower(), 1.0))

    # Add entities (slightly higher weight)
    for term in query_info["entities"]:
        weighted_terms.append((term.lower(), 1.1))

    # Add noun chunks (higher weight for multi-word phrases)
    if "noun_chunks" in query_info:
        for term in query_info["noun_chunks"]:
            weighted_terms.append((term.lower(), 1.2))

    # Add important charity-related keywords (highest weight)
    if "important_keywords" in query_info:
        for term in query_info["important_keywords"]:
            weighted_terms.append((term.lower(), 1.5))

    # Add charity-specific entities (highest weight)
    if "charity_entities" in query_info:
        for term in query_info["charity_entities"]:
            weighted_terms.append((term.lower(), 1.6))

    # Add contextual information (medium-high weight)
    if "contextual_info" in query_info:
        for term in query_info["contextual_info"]:
            weighted_terms.append((term.lower(), 1.3))

    # Create a set of unique terms to avoid duplicate processing
    # Use a dictionary to keep the highest weight for each term
    unique_weighted_terms = {}
    for term, weight in weighted_terms:
        if term in unique_weighted_terms:
            unique_weighted_terms[term] = max(unique_weighted_terms[term], weight)
        else:
            unique_weighted_terms[term] = weight

    # Common charity categories to give higher weight
    important_categories = {
        "education": 1.5,
        "health": 1.5,
        "environment": 1.5,
        "poverty": 1.5,
        "children": 1.5,
        "animal": 1.5,
        "disaster": 1.5,
        "humanitarian": 1.5,
        "rights": 1.5,
        "community": 1.4,
        "development": 1.4,
        "research": 1.4,
        "medical": 1.4,
        "relief": 1.4,
        "support": 1.3,
        "aid": 1.3,
        "assistance": 1.3,
        "care": 1.3
    }

    # Check each term against focus areas
    for term, base_weight in unique_weighted_terms.items():
        # Skip very short terms
        if len(term) < 3:
            continue

        # Determine term weight based on importance
        term_weight = base_weight
        for category, weight in important_categories.items():
            if category in term:
                term_weight *= weight  # Multiply weights for compounding effect
                break

        # Exact match lookup (highest weight)
        if term in focus_area_index:
            for charity_id, _ in focus_area_index[term]:
                matches[charity_id] = matches.get(charity_id, 0) + (1.0 * term_weight)

        # Word boundary match (medium weight)
        # This checks if the term appears as a whole word in the focus area
        for focus_area in focus_area_index:
            if re.search(r'\b' + re.escape(term) + r'\b', focus_area):
                for charity_id, _ in focus_area_index[focus_area]:
                    matches[charity_id] = matches.get(charity_id, 0) + (0.8 * term_weight)

        # Fuzzy matching using Levenshtein distance
        # Only for terms of sufficient length to avoid false matches
        if len(term) >= 4:
            for focus_area in focus_area_index:
                # Skip exact matches (already handled)
                if term == focus_area:
                    continue

                # Calculate Levenshtein distance
                try:
                    distance = Levenshtein.distance(term, focus_area)

                    # Only consider close matches
                    max_distance = min(3, len(term) // 3)  # Adaptive threshold based on term length

                    if distance <= max_distance:
                        # Calculate similarity score (1.0 = exact match, decreasing with distance)
                        similarity = 1.0 - (distance / (len(term) + 1))

                        # Apply similarity score to weight
                        match_weight = 0.7 * similarity * term_weight

                        for charity_id, _ in focus_area_index[focus_area]:
                            matches[charity_id] = matches.get(charity_id, 0) + match_weight
                except Exception:
                    # Skip if Levenshtein calculation fails
                    pass

        # Partial match lookup (lowest weight)
        # Only do this for terms that are at least 5 characters long to avoid false matches
        if len(term) >= 5:
            for focus_area in focus_area_index:
                if term in focus_area and not re.search(r'\b' + re.escape(term) + r'\b', focus_area):
                    for charity_id, _ in focus_area_index[focus_area]:
                        matches[charity_id] = matches.get(charity_id, 0) + (0.4 * term_weight)

    # Apply a logarithmic scaling to prevent extreme scores
    scaled_matches = {charity_id: math.log(1 + score) for charity_id, score in matches.items()}

    # Normalize scores
    max_score = max(scaled_matches.values()) if scaled_matches else 1
    return [(charity_id, score/max_score) for charity_id, score in scaled_matches.items()]

# Advanced prediction function with state-of-the-art scoring and filtering
def predict_charities(user_input, top_n=5):
    # Preprocess the query with advanced NLP
    query_info = preprocess_query(user_input)

    # Get semantic similarity matches with enhanced techniques
    semantic_matches = get_semantic_similarity(query_info)
    semantic_charity_ids = {charity_id: score for charity_id, score in semantic_matches}

    # Get focus area matches with fuzzy matching
    focus_matches = match_focus_areas(query_info)
    focus_charity_ids = {charity_id: score for charity_id, score in focus_matches}

    # Combine all matching charity IDs
    all_charity_ids = set(semantic_charity_ids.keys()).union(set(focus_charity_ids.keys()))

    if not all_charity_ids:
        return []

    # Calculate final scores and prepare results
    final_recommendations = []
    raw_scores = []

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

        # Calculate a combined match score for determining match type
        combined_match_score = (semantic_score + focus_score) / 2

        # Determine match type with more nuanced classification
        if semantic_score > 0.7 and focus_score > 0.7:
            match_type = "both"
            match_strength = combined_match_score * 1.1  # Bonus for strong match on both dimensions
        elif semantic_score > 0.7:
            match_type = "description"
            match_strength = semantic_score * 1.05  # Slight bonus for strong description match
        elif focus_score > 0.7:
            match_type = "category"
            match_strength = focus_score * 1.05  # Slight bonus for strong category match
        elif semantic_score > 0.4 and focus_score > 0.4:
            # Medium confidence match on both dimensions
            match_type = "both"
            match_strength = combined_match_score
        elif semantic_score > 0.4:
            match_type = "description"
            match_strength = semantic_score
        elif focus_score > 0.4:
            match_type = "category"
            match_strength = focus_score
        elif semantic_score > 0 and focus_score > 0:
            # Lower confidence match on both dimensions
            match_type = "both"
            match_strength = combined_match_score * 0.9  # Slight penalty for lower confidence
        elif semantic_score > 0:
            match_type = "description"
            match_strength = semantic_score * 0.9  # Slight penalty for lower confidence
        else:
            match_type = "category"
            match_strength = focus_score * 0.9  # Slight penalty for lower confidence

        # Calculate combined relevance score with adaptive weighting
        # Base weights
        model_weight = 0.25  # Reduced model weight
        semantic_weight = 0.375  # Increased semantic weight
        focus_weight = 0.375  # Increased focus weight

        # Adjust weights based on score confidence and query characteristics
        # Check if query has strong charity-specific terms
        has_charity_terms = len(query_info.get("charity_entities", [])) > 0 or len(query_info.get("important_keywords", [])) > 0

        if has_charity_terms:
            # If query has charity-specific terms, give more weight to focus area matching
            focus_weight += 0.1
            model_weight -= 0.05
            semantic_weight -= 0.05

        # Adjust weights based on score confidence
        if semantic_score > 0.8:
            semantic_weight += 0.15
            model_weight -= 0.075
            focus_weight -= 0.075
        elif focus_score > 0.8:
            focus_weight += 0.15
            model_weight -= 0.075
            semantic_weight -= 0.075
        elif semantic_score > 0.6:
            semantic_weight += 0.1
            model_weight -= 0.05
            focus_weight -= 0.05
        elif focus_score > 0.6:
            focus_weight += 0.1
            model_weight -= 0.05
            semantic_weight -= 0.05

        # Calculate final relevance score
        relevance = (model_score * model_weight) + (semantic_score * semantic_weight) + (focus_score * focus_weight)

        # Apply various boosting factors

        # Boost score for charities with websites (indicates legitimacy)
        if charity_info.get("website"):
            relevance *= 1.08  # 8% boost for having a website

        # Boost score for charities with longer, more detailed descriptions
        description_length = len(charity_info["description"])
        if description_length > 300:  # Long, detailed description
            relevance *= 1.05
        elif description_length > 150:  # Medium-length description
            relevance *= 1.03

        # Boost score for charities with multiple focus areas (more comprehensive)
        if len(charity_info["focus_areas_list"]) >= 3:
            relevance *= 1.04  # 4% boost for having 3+ focus areas

        # Store raw score for outlier detection
        raw_scores.append(relevance)

        # Create recommendation object with enhanced details
        recommendation = {
            "charityId": int(charity_info["charityId"]),
            "name": charity_info["name"],
            "description": charity_info["description"],
            "focus_areas": charity_info["focus_areas_list"],
            "relevance_score": float(relevance),
            "match_details": {
                "match_type": match_type,
                "match_strength": float(match_strength),
                "semantic_score": float(semantic_score),
                "focus_score": float(focus_score),
                "model_score": float(model_score)
            },
            "website": charity_info.get("website", None)  # Include website URL
        }

        final_recommendations.append(recommendation)

    # Sort by relevance score
    final_recommendations.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Apply post-processing to ensure diversity and quality
    if len(final_recommendations) > top_n:
        # Get the top recommendations
        top_recommendations = final_recommendations[:top_n]

        # Check if we have enough diversity in match types
        match_types = [rec["match_details"]["match_type"] for rec in top_recommendations]

        # If all top recommendations are of the same match type, try to add diversity
        if len(set(match_types)) == 1 and len(final_recommendations) > top_n + 3:
            # Find recommendations with different match types
            diverse_candidates = [rec for rec in final_recommendations[top_n:top_n+10]
                                if rec["match_details"]["match_type"] != match_types[0]]

            # If we found diverse candidates, replace the lowest-scoring top recommendation
            if diverse_candidates:
                # Replace the lowest-scoring recommendation with the highest-scoring diverse candidate
                top_recommendations = top_recommendations[:-1] + [diverse_candidates[0]]
                # Re-sort by relevance score
                top_recommendations.sort(key=lambda x: x["relevance_score"], reverse=True)

        return top_recommendations
    else:
        return final_recommendations

# API Endpoint: Predict Charities
@app.get("/predict", response_model=List[Charity], summary="Get charity recommendations")
async def predict(
    query: str = Query(..., description="The cause or interest"),
    top_n: int = Query(8, description="Number of results to return", ge=1, le=20)
):
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")

    try:
        # Log the incoming request for monitoring
        print(f"Processing charity recommendation request: '{query}', top_n={top_n}")

        # Get recommendations with the requested number of results
        recommendations = predict_charities(query, top_n=top_n)

        if not recommendations:
            print(f"No recommendations found for query: '{query}'")
            return []

        print(f"Returning {len(recommendations)} recommendations for query: '{query}'")
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
    uvicorn.run("server:app", host="127.0.0.1", port=5000, reload=False)