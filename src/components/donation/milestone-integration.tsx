"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import MilestoneProgressCard from "./milestone-progress-card"

interface MilestoneData {
  id: string
  milestone_name: string
  target_amount: number
  funds_raised: number
  status: "pending" | "completed"
}

interface MilestoneIntegrationProps {
  contractAddress: string
  contractAbi: any[]
}

export default function MilestoneIntegration({ contractAddress, contractAbi }: MilestoneIntegrationProps) {
  const [milestones, setMilestones] = useState<MilestoneData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!contractAddress || !contractAbi) {
        setLoading(false)
        return
      }

      try {
        const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/139d352315cd4c96ab2c5ec31db8c776")
        const contract = new ethers.Contract(contractAddress, contractAbi, provider)

        // Get milestone count from contract
        const milestonesCount = await contract.getMilestonesCount()
        const milestonesData: MilestoneData[] = []

        // Fetch each milestone
        for (let i = 0; i < milestonesCount; i++) {
          const milestone = await contract.getMilestone(i)

          // Extract milestone data from contract
          // Assuming the contract returns: [name, wallet, targetAmount, currentAmount, completed]
          const name = milestone[0] || `Milestone ${i + 1}`
          const targetAmount = Number(ethers.formatEther(milestone[2]))
          const currentAmount = Number(ethers.formatEther(milestone[3]))
          const completed = milestone[4]

          milestonesData.push({
            id: i.toString(),
            milestone_name: name,
            target_amount: targetAmount,
            funds_raised: currentAmount,
            status: completed ? "completed" : "pending",
          })
        }

        setMilestones(milestonesData)
      } catch (error) {
        console.error("Error fetching milestones:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
  }, [contractAddress, contractAbi])

  if (loading) {
    return <div>Loading milestone data...</div>
  }

  return <MilestoneProgressCard milestones={milestones} />
}

