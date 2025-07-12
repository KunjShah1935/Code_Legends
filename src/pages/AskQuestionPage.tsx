import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { RichTextEditor } from '../components/RichTextEditor';
import { TagInput } from '../components/TagInput';
import { questionsAPI, tagsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(5, 'Maximum 5 tags allowed'),
});

type QuestionForm = z.infer<typeof questionSchema>;

export function AskQuestionPage() {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
    },
  });

  const title = watch('title');

  useEffect(() => {
    fetchSuggestedTags();
  }, []);

  useEffect(() => {
    setValue('description', description);
  }, [description, setValue]);

  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  const fetchSuggestedTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setSuggestedTags(response.data.tags.map((tag: any) => tag.name));
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const onSubmit = async (data: QuestionForm) => {
    if (!user) {
      toast.error('Please sign in to ask a question');
      return;
    }

    try {
      setLoading(true);
      const response = await questionsAPI.create({
        title: data.title,
        description: data.description,
        tags: data.tags,
      });
      
      toast.success('Question posted successfully!');
      navigate(`/questions/${response.data.question._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to ask a question.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-600">
          Get help from the community by asking a clear, detailed question.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Details</h2>
              
              <div className="space-y-4">
                <Input
                  label="Title"
                  placeholder="What's your programming question? Be specific."
                  {...register('title')}
                  error={errors.title?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Provide details about your question. Include what you've tried and what you expect to happen."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <TagInput
                    tags={tags}
                    onChange={setTags}
                    suggestions={suggestedTags}
                    placeholder="Add up to 5 tags to describe what your question is about"
                    maxTags={5}
                  />
                  {errors.tags && (
                    <p className="text-sm text-red-600 mt-1">{errors.tags.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Post Question
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {/* Tips */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Writing a Good Question</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Summarize your problem in the title</li>
              <li>• Describe what you've tried</li>
              <li>• Show some code if relevant</li>
              <li>• Include error messages</li>
              <li>• Use relevant tags</li>
            </ul>
          </div>

          {/* Preview */}
          {title && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">{title}</h4>
                {description && (
                  <div
                    className="text-sm text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}