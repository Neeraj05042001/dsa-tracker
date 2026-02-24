'use client'

import { useMemo } from 'react'
// import { useProblemStore } from '@/store/problemStore'
import { Problem } from '@/types'

interface ProblemListProps {
  onEdit?: (problem: Problem) => void
}

export default function ProblemList({ onEdit }: ProblemListProps) {
  const { problems, loading, error, filters, deleteProblem, getFilteredProblems } = useProblemStore()
  const filteredProblems = useMemo(() => getFilteredProblems(), [filters, problems])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'solved' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800'
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this problem?')) {
      try {
        await deleteProblem(id)
      } catch (error) {
        alert('Failed to delete problem')
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading problems...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    )
  }

  if (problems.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 px-4 py-8 rounded text-center text-gray-600">
        No problems yet. Add your first problem to get started!
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Problem</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Platform</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Difficulty</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Your Rating</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Revision</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filteredProblems.map((problem) => (
            <tr key={problem.id} className="hover:bg-gray-50">
              {/* Problem Name */}
              <td className="px-6 py-4">
                <div className="max-w-xs">
                  {problem.problem_link ? (
                    <a
                      href={problem.problem_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {problem.problem_name}
                    </a>
                  ) : (
                    <span className="font-medium">{problem.problem_name}</span>
                  )}
                </div>
              </td>

              {/* Platform */}
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600 capitalize">{problem.platform}</span>
              </td>

              {/* Difficulty */}
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </td>

              {/* Your Rating */}
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(problem.user_difficulty)}`}>
                  {problem.user_difficulty}
                </span>
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(problem.status)}`}>
                  {problem.status}
                </span>
              </td>

              {/* Revision */}
              <td className="px-6 py-4">
                {problem.needs_revision ? (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    ✓ For Review
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit?.(problem)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(problem.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="bg-gray-50 px-6 py-4 border-t text-sm text-gray-600">
        Showing {filteredProblems.length} of {problems.length} problems
      </div>
    </div>
  )
}