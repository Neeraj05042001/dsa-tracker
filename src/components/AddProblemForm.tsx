'use client'

import { useState } from 'react'
// import { useAuthStore } from '@/store/authStore'
// import { useProblemStore } from '@/store/problemStore'
import { PlatformType, DifficultyLevel, StatusType } from '@/types'

interface AddProblemFormProps {
  onSuccess?: () => void
}

export default function AddProblemForm({ onSuccess }: AddProblemFormProps) {
  const { user } = useAuthStore()
  const { addProblem, error } = useProblemStore()
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    problem_name: '',
    problem_link: '',
    platform: 'leetcode' as PlatformType,
    difficulty: 'medium' as DifficultyLevel,
    user_difficulty: 'medium' as DifficultyLevel,
    status: 'attempted' as StatusType,
    needs_revision: false,
    remarks: '',
    tags: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validation
    if (!formData.problem_name.trim()) {
      setFormError('Problem name is required')
      return
    }

    if (!user) {
      setFormError('User not logged in')
      return
    }

    setLoading(true)

    try {
      // Parse tags (comma-separated)
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      await addProblem({
        user_id: user.id,
        problem_name: formData.problem_name,
        problem_link: formData.problem_link || null,
        platform: formData.platform,
        difficulty: formData.difficulty,
        user_difficulty: formData.user_difficulty,
        status: formData.status,
        needs_revision: formData.needs_revision,
        remarks: formData.remarks || null,
        tags,
      } as any)

      // Reset form
      setFormData({
        problem_name: '',
        problem_link: '',
        platform: 'leetcode',
        difficulty: 'medium',
        user_difficulty: 'medium',
        status: 'attempted',
        needs_revision: false,
        remarks: '',
        tags: '',
      })

      onSuccess?.()
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add New Problem</h2>

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Problem Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Problem Name *</label>
          <input
            type="text"
            name="problem_name"
            value={formData.problem_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Two Sum"
            required
          />
        </div>

        {/* Problem Link */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Problem Link</label>
          <input
            type="url"
            name="problem_link"
            value={formData.problem_link}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://leetcode.com/problems/..."
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Platform</label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Platform Difficulty */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Platform Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Your Difficulty Rating */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Your Difficulty Rating</label>
          <select
            name="user_difficulty"
            value={formData.user_difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy for me</option>
            <option value="medium">Medium for me</option>
            <option value="hard">Hard for me</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
          </select>
        </div>
      </div>

      {/* Remarks */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Remarks (Optional)</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your approach, mistakes, insights..."
          rows={4}
        />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Tags (comma-separated)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., array, sorting, two-pointer"
        />
      </div>

      {/* Needs Revision Checkbox */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="needs_revision"
            checked={formData.needs_revision}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700">Mark for revision (interview prep)</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding problem...' : 'Add Problem'}
      </button>
    </form>
  )
}