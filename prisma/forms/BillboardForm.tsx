// components/BillboardForm.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Billboard {
  id: string;
  ministryId: string;
  departmentId: string;
  userId: string;
  label: string;
  content: string;
  imageUrl: string;
  categories: unknown[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default function BillboardForm() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [formData, setFormData] = useState<Omit<Billboard, 'id' | 'createdAt' | 'updatedAt'>>({
    ministryId: '',
    departmentId: '',
    userId: '',
    label: '',
    content: '',
    imageUrl: '',
    categories: [],
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchBillboards();
  }, []);

  const fetchBillboards = async () => {
    try {
      const res = await axios.get('/api/dbhandler?model=billboards');
      setBillboards(res.data);
    } catch (err) {
      console.error('Failed to fetch billboards', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/dbhandler?model=billboards&id=${editId}`, formData);
      } else {
        await axios.post('/api/dbhandler?model=billboards', formData);
      }
      resetForm();
      fetchBillboards();
    } catch (err) {
      alert('Failed to save billboard.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this billboard?')) return;
    try {
      await axios.delete(`/api/dbhandler?model=billboards&id=${id}`);
      fetchBillboards();
    } catch (err) {
      alert('Failed to delete billboard.');
    }
  };

  const handleEdit = (billboard: Billboard) => {
    setEditId(billboard.id);
    setFormData({
      ministryId: billboard.ministryId,
      departmentId: billboard.departmentId,
      userId: billboard.userId,
      label: billboard.label,
      content: billboard.content,
      imageUrl: billboard.imageUrl,
      categories: billboard.categories,
    });
  };

  const resetForm = () => {
    setFormData({
      ministryId: '',
      departmentId: '',
      userId: '',
      label: '',
      content: '',
      imageUrl: '',
      categories: [],
    });
    setEditId(null);
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm gap-2 justify-center items-center p-3 border-2 border-secondary-foreground rounded-sm m-2'>
        <h2>Manage Billboards</h2>
        <Input
          placeholder="Ministry ID"
          value={formData.ministryId}
          onChange={(e) => setFormData({ ...formData, ministryId: e.target.value })}
        />
        <Input
          placeholder="Department ID"
          value={formData.departmentId}
          onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
        />
        <Input
          placeholder="User ID"
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
        />
        <Input
          placeholder="Label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />
        <Input
          placeholder="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />
        <Input
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
        />
        <Input
          placeholder="Categories (JSON)"
          value={JSON.stringify(formData.categories)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData({ ...formData, categories: parsed });
            } catch {
              // Ignore invalid JSON
            }
          }}
        />
        <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        {editId && <Button type="button" onClick={resetForm}>Cancel</Button>}
      </form>

      <ul>
        {billboards.map((b) => (
          <li key={b.id}>
            <strong>{b.label}</strong> - {b.content.substring(0, 30)}...
            <br />
            <small>Ministry ID: {b.ministryId}</small>
            <br />
            <Button onClick={() => handleEdit(b)}>Edit</Button>
            <Button onClick={() => handleDelete(b.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}