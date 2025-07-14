// components/CommentForm.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Comment } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API_URL = '/api/dbhandler';

export default function CommentForm() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [formData, setFormData] = useState<Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>>({
    ministryId: '',
    contentId: '',
    userId: '',
    isArchived: false,
    reply: false,
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const res = await axios.get(`${API_URL}?model=comments`);
    setComments(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}?model=comments&id=${editId}`, formData);
      } else {
        await axios.post(`${API_URL}?model=comments`, formData);
      }
      resetForm();
      fetchComments();
    } catch (err) {
      alert('Failed to save comment.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    await axios.delete(`${API_URL}?model=comments&id=${id}`);
    fetchComments();
  };

  const handleEdit = (item: Comment) => {
    setEditId(item.id);
    setFormData({
      ministryId: item.ministryId,
      contentId: item.contentId,
      userId: item.userId,
      isArchived: item.isArchived,
      reply: item.reply,
    });
  };

  const resetForm = () => {
    setFormData({
      ministryId: '',
      contentId: '',
      userId: '',
      isArchived: false,
      reply: false,
    });
    setEditId(null);
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm gap-2 justify-center items-center p-3 border-2 border-secondary-foreground rounded-sm m-2'>
        <h2>Manage Comments</h2>
        <Input placeholder="Ministry ID" value={formData.ministryId} onChange={(e) => setFormData({ ...formData, ministryId: e.target.value })} />
        <Input placeholder="Content ID" value={formData.contentId} onChange={(e) => setFormData({ ...formData, contentId: e.target.value })} />
        <Input placeholder="User ID" value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} />
        <label><input type="checkbox" checked={formData.isArchived} onChange={() => setFormData({ ...formData, isArchived: !formData.isArchived })} /> Archived</label>
        <label><input type="checkbox" checked={formData.reply} onChange={() => setFormData({ ...formData, reply: !formData.reply })} /> Reply</label>
        <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        {editId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <ul>
        {comments.map((item) => (
          <li key={item.id}>
            <strong>ID:</strong> {item.id} |
            <strong>Ministry:</strong> {item.ministryId} |
            <strong>User:</strong> {item.userId}
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}