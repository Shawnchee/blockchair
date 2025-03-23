"use client";

import React, { useState } from "react";

export default function wallet() {
  const [totalAmount, setTotalAmount] = useState("");
  const [allocations, setAllocations] = useState([{ wallet: "", percentage: "" }]);

  // Handle changes in total amount
  const handleTotalAmountChange = (e) => {
    setTotalAmount(e.target.value);
  };

  // Handle changes in allocation fields
  const handleAllocationChange = (index, field, value) => {
    const newAllocations = [...allocations];
    newAllocations[index][field] = value;
    setAllocations(newAllocations);
  };

  // Add a new allocation row
  const addAllocation = () => {
    setAllocations([...allocations, { wallet: "", percentage: "" }]);
  };

  // Remove an allocation row
  const removeAllocation = (index) => {
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const totalPercentage = allocations.reduce((sum, alloc) => sum + Number(alloc.percentage), 0);
    
    if (totalPercentage !== 100) {
      alert("Total percentage must equal 100%");
      return;
    }

    const charityData = {
      totalAmount,
      allocations,
    };

    console.log("Charity Project Data:", charityData);
    alert("Charity project setup complete!");
    
    // TODO: Send this data to a backend or blockchain smart contract
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Set Up Charity Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">Total Amount to Raise (SOL)</label>
          <input
            type="number"
            value={totalAmount}
            onChange={handleTotalAmountChange}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>

        <div>
          <h3 className="font-medium text-gray-700">Allocations</h3>
          {allocations.map((alloc, index) => (
            <div key={index} className="flex space-x-2 mt-2">
              <input
                type="text"
                placeholder="Wallet Address"
                value={alloc.wallet}
                onChange={(e) => handleAllocationChange(index, "wallet", e.target.value)}
                className="flex-1 p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="%"
                value={alloc.percentage}
                onChange={(e) => handleAllocationChange(index, "percentage", e.target.value)}
                className="w-20 p-2 border rounded"
                required
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeAllocation(index)}
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addAllocation}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
          >
            + Add Wallet
          </button>
        </div>

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">
          Submit Charity Project
        </button>
      </form>
    </div>
  );
}

  