import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { getProblemByKey, getSubmissionHistory } from "@/lib/queries";
import { ProblemDetail } from "@/components/problems/ProblemDetail";

interface Props {
  params: Promise<{ key: string }>;
}

export default async function ProblemDetailPage({ params }: Props) {
  // Fetch problem + submission history in parallel
  const { key } = await params;
  const [problem, submissions] = await Promise.all([
    getProblemByKey(key),
    getSubmissionHistory(key),
  ]);

  if (!problem) notFound();

  return (
    <>
      <Topbar
        title={problem.problem_name}
        subtitle={`${problem.platform === "leetcode" ? "LeetCode" : problem.platform === "codeforces" ? "Codeforces" : problem.platform} · ${problem.difficulty ?? problem.user_difficulty ?? "Unknown difficulty"}`}
      />
      <div className="dashboard-content">
        <ProblemDetail problem={problem} submissions={submissions} />
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const problem = await getProblemByKey(params.key);
  return {
    title: problem
      ? `${problem.problem_name} — DSA Tracker`
      : "Problem Not Found — DSA Tracker",
  };
}