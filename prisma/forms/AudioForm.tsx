// components/AudioForm.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Audio {
  id: string;
  ministryId: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AudioForm() {
  const [audios, setAudios] = useState<Audio[]>([]);
  const [formData, setFormData] = useState<Omit<Audio, 'id' | 'createdAt' | 'updatedAt'>>({
    ministryId: '',
    title: '',
    description: '',
    audioUrl: '',
    duration: '',
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchAudios();
  }, []);

  const fetchAudios = async () => {
    try {
      const res = await axios.get('/api/dbhandler?model=audios');
      setAudios(res.data);
    } catch (err) {
      console.error('Failed to fetch audios', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/dbhandler?model=audios&id=${editId}`, formData);
      } else {
        await axios.post('/api/dbhandler?model=audios', formData);
      }
      resetForm();
      fetchAudios();
    } catch (err) {
      alert('Failed to save audio.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audio?')) return;
    try {
      await axios.delete(`/api/dbhandler?model=audios&id=${id}`);
      fetchAudios();
    } catch (err) {
      alert('Failed to delete audio.');
    }
  };

  const handleEdit = (audio: Audio) => {
    setEditId(audio.id);
    setFormData({
      ministryId: audio.ministryId,
      title: audio.title,
      description: audio.description || '',
      audioUrl: audio.audioUrl,
      duration: audio.duration || '',
    });
  };

  const resetForm = () => {
    setFormData({ ministryId: '', title: '', description: '', audioUrl: '', duration: '' });
    setEditId(null);
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm gap-2 justify-center items-center p-3 border-2 border-secondary-foreground rounded-sm m-2'>
        <h2>Manage Audios</h2>
        <Input
          placeholder="Ministry ID"
          value={formData.ministryId}
          onChange={(e) => setFormData({ ...formData, ministryId: e.target.value })}
        />
        <Input
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <Input
          placeholder="Audio URL"
          value={formData.audioUrl}
          onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
        />
        <Input
          placeholder="Duration (e.g., 5:30)"
          value={formData.duration || ''}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
        />
        <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        {editId && <Button type="button" onClick={resetForm}>Cancel</Button>}
      </form>

      <ul>
        {audios.map((audio) => (
          <li key={audio.id}>
            <strong>{audio.title}</strong> - {audio.description || 'No description'}
            <br />
            <small>Ministry ID: {audio.ministryId}</small>
            <br />
            <Button onClick={() => handleEdit(audio)}>Edit</Button>
            <Button onClick={() => handleDelete(audio.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}