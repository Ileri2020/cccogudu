// MinistryForm.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MinistryForm() {
  const [ministries, setMinistries] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    admins: [],
    about: '',
    logoUrl: ''
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchMinistries();
  }, []);




  const fetchMinistries = async () => {
    const res = await axios.get('/api/dbhandler?model=ministries');
    console.log("ministries :", res.data)
    setMinistries(res.data);
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("about to send to db",formData)
    if (editId) {
      await axios.put(`/api/dbhandler?model=ministries&id=${editId}`, formData);
      // dbhandler(ministries,"null", "PUT", FormData)
    } else {
      const { status, data, statusText } = await axios.post(
        '/api/dbhandler?model=ministries',
        formData
      );
      console.log('Status:', status, 'Data:', data, 'Status Text:', statusText);
      // dbhandler(ministries,"null", "POST", FormData)
    }
    resetForm();
    fetchMinistries();
  };




  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };




  const handleDelete = async (id) => {
    await axios.delete(`/api/dbhandler?model=ministries&id=${id}`);
    fetchMinistries();
  };




  const resetForm = () => {
    setFormData({ name: '', admins: [], about: '', logoUrl: '' });
    setEditId(null);
  };




  return (
    <div>
      
      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm gap-2 justify-center items-center p-3 border-2 border-secondary-foreground rounded-sm m-2'>
      <h2>Manage Ministries</h2>
      <Input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Admins (comma-separated)"
          value={formData.admins.join(',')}
          onChange={(e) => setFormData({ ...formData, admins: e.target.value.split(',') })}
        />
        <Input
          type="text"
          placeholder="About"
          value={formData.about || ''}
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Logo URL"
          value={formData.logoUrl}
          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
        />
        <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        {editId && <button onClick={resetForm}>Cancel</button>}
      </form>

      <ul>
        {ministries.length > 0 ? (
          ministries.map((item , index) => (
            <li key={index} className="flex flex-col justify-center items-center gap-2 my-2">
              <div className="flex flex-row gap-2">
                <span>{(index + 1)}.</span>
                <span>{item.name}</span>
              </div>
              <p>{item.about || <em>No description</em>}</p>
              <div className='flex flex-row gap-2 p-1 w-full'>
                <Button onClick={() => handleEdit(item)} className='flex-1'>Edit</Button>
                <Button onClick={() => handleDelete(item.id)} variant='ghost' className='flex-1 border-2 border-accent'>Delete</Button>
              </div>
            </li>
          ))
        ) : (
          <p>No ministries to display.</p>
        )}
      </ul>
    </div>
  );
}