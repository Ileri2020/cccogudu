// components/BookForm.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Book {
  id: string;
  ministryId: string;
  title: string;
  author?: string;
  coverUrl?: string;
  fileUrl: string;
  downloads: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function BookForm() {
  const [books, setBooks] = useState<Book[]>([]);
  const [formData, setFormData] = useState<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>({
    ministryId: '',
    title: '',
    author: '',
    coverUrl: '',
    fileUrl: '',
    downloads: 0,
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/dbhandler?model=books');
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/dbhandler?model=books&id=${editId}`, formData);
      } else {
        await axios.post('/api/dbhandler?model=books', formData);
      }
      resetForm();
      fetchBooks();
    } catch (err) {
      alert('Failed to save book.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`/api/dbhandler?model=books&id=${id}`);
      fetchBooks();
    } catch (err) {
      alert('Failed to delete book.');
    }
  };

  const handleEdit = (book: Book) => {
    setEditId(book.id);
    setFormData({
      ministryId: book.ministryId,
      title: book.title,
      author: book.author || '',
      coverUrl: book.coverUrl || '',
      fileUrl: book.fileUrl,
      downloads: book.downloads,
    });
  };

  const resetForm = () => {
    setFormData({
      ministryId: '',
      title: '',
      author: '',
      coverUrl: '',
      fileUrl: '',
      downloads: 0,
    });
    setEditId(null);
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm gap-2 justify-center items-center p-3 border-2 border-secondary-foreground rounded-sm m-2'>
        <h2>Manage Books</h2>
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
          placeholder="Author"
          value={formData.author || ''}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />
        <Input
          placeholder="Cover URL"
          value={formData.coverUrl || ''}
          onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
        />
        <Input
          placeholder="PDF/EPUB URL"
          value={formData.fileUrl}
          onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Downloads"
          value={formData.downloads}
          onChange={(e) => setFormData({ ...formData, downloads: Number(e.target.value) })}
        />
        <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
        {editId && <Button type="button" onClick={resetForm}>Cancel</Button>}
      </form>

      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> by {book.author || 'Unknown'}
            <br />
            <small>Ministry ID: {book.ministryId}</small>
            <br />
            <Button onClick={() => handleEdit(book)}>Edit</Button>
            <Button onClick={() => handleDelete(book.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}