import Leaderboard from "@/components/leaderboard";
import MilestoneTrackingPersonal from "@/components/profile/milestone-tracking-personal";
import WalletTransaction from "@/components/profile/walletTransaction";

export default function profilePage(){
    return (
        <div className="min-h-screen pt-24">
        <MilestoneTrackingPersonal/>
        <WalletTransaction/>
        <Leaderboard/>
        </div>
    )
}