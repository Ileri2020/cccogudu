// DepartmentForm.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DepartmentForm() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    ministryId: '',
    name: '',
    imgUrl: '',
    description: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await axios.get('/api/dbhandler?model=departments');
    setDepartments(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`/api/dbhandler?model=departments&id=${editId}`, formData);
    } else {
      await axios.post('/api/dbhandler?model=departments', formData);
    }
    resetForm();
    fetchDepartments();
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/dbhandler?model=departments&id=${id}`);
    fetchDepartments();
  };

  const resetForm = () => {
    setFormData({ ministryId: '', name: '', imgUrl: '', description: '' });
    setEditId(null);
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm gap-2 justify-center items-center p-3 border-2 border-secondary-foreground rounded-sm m-2'>
        <h2>Manage Departments</h2>
        <Input
          type="text"
          placeholder="Ministry ID"
          value={formData.ministryId}
          onChange={(e) => setFormData({ ...formData, ministryId: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Image URL"
          value={formData.imgUrl}
          onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        {editId && <button onClick={resetForm}>Cancel</button>}
      </form>

      <ul>
        {departments.map((item) => (
          <li key={item.id}>
            {item.name} - {item.description || 'No description'}
            <Button onClick={() => handleEdit(item)}>Edit</Button>
            <Button onClick={() => handleDelete(item.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}