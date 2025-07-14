// components/VideoForm.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Video } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API_URL = '/api/dbhandler';

export default function VideoForm() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [formData, setFormData] = useState<Omit<Video, 'id' | 'createdAt' | 'updatedAt'>>({
    ministryId: '',
    title: '',
    description: '',
    videoUrl: '',
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await axios.get(`${API_URL}?model=videos`);
    setVideos(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}?model=videos&id=${editId}`, formData);
      } else {
        await axios.post(`${API_URL}?model=videos`, formData);
      }
      resetForm();
      fetchVideos();
    } catch (err) {
      alert('Failed to save video.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    await axios.delete(`${API_URL}?model=videos&id=${id}`);
    fetchVideos();
  };

  const handleEdit = (item: Video) => {
    setEditId(item.id);
    setFormData({
      ministryId: item.ministryId,
      title: item.title,
      description: item.description || '',
      videoUrl: item.videoUrl,
    });
  };

  const resetForm = () => {
    setFormData({ ministryId: '', title: '', description: '', videoUrl: '' });
    setEditId(null);
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm gap-2 justify-center items-center p-3 border-2 border-secondary-foreground rounded-sm m-2'>
      <h2>Manage Videos</h2>
      <Input placeholder="Ministry ID" value={formData.ministryId} onChange={(e) => setFormData({ ...formData, ministryId: e.target.value })} />
        <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        <Input placeholder="Video URL" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} />
        <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        {editId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <ul>
        {videos.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong> | Ministry: {item.ministryId}
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}