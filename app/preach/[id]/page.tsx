

"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from '@/components/myComponents/subs/post';

const Preaching = () => {
  const [allpost, setallpost] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [postTypes, setPostTypes] = useState({ video: true, audio: true, document: true, });

  const fetchallpost = () =>{
    axios.get('/api/dbhandler', { params: { model: 'posts', } })
      .then(response => {
        const posts = response.data;
        let filteredPosts = posts.filter(post => post.for === 'preaching' && (postTypes[post.type] || (post.type === 'image' && postTypes.document)));
        filteredPosts = filteredPosts.sort((a, b) => sortOrder === 'asc' ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime() : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setallpost(filteredPosts);
      })
      .catch(error => {
        console.error(error);
      });
  }

  useEffect(() => {
    fetchallpost();
  }, [sortOrder, postTypes]);

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  }

  const handlePostTypeChange = (e) => {
    setPostTypes({ ...postTypes, [e.target.name]: e.target.checked, });
  }

  if (!allpost) return <div>Loading...</div>;

  const audioPosts = allpost.filter(post => post.type === 'audio');
  const videoPosts = allpost.filter(post => post.type === 'video');
  const documentPosts = allpost.filter(post => post.type === 'document' || post.type === 'image');

  const renderPosts = (posts) => {
    return posts.map((post, index)=>{
      return(
        <Post 
          key={index} 
          url={post.url} 
          time={post.updatedAt} 
          owner={post.userId} 
          event={post.event} 
          post={post.description} 
          type={post.type} 
          id={post.id} 
          for={post.for} 
          title={post.title} 
        />
      )
    })
  }

  return (
    <div>
      <div className="absolute w-[360px] flex flex-row justify-between">
        <select value={sortOrder} onChange={handleSortChange} className="mb-4 w-20">
          <option value="asc">Asc</option>
          <option value="desc">Dsc</option>
        </select>
        <div className="mb-4">
          <label>
            <input type="checkbox" name="video" checked={postTypes.video} onChange={handlePostTypeChange} />
            Video
          </label>
          <label className="ml-4">
            <input type="checkbox" name="audio" checked={postTypes.audio} onChange={handlePostTypeChange} />
            Audio
          </label>
          <label className="ml-4">
            <input type="checkbox" name="document" checked={postTypes.document} onChange={handlePostTypeChange} />
            Document
          </label>
        </div>
      </div>
      <Tabs defaultValue="audio" className="flex flex-col lg:flex-row gap-[60px] my-5">
        <TabsList className="flex flex-row lg:flex-col w-full max-w-[380px] lg:max-w-[280px] xl:max-w-[340px] max-h-[177px] mx-auto /xl:mx-0 gap-1 ">
          <TabsTrigger value="audio" className='rounded-full flex-1'>Audios</TabsTrigger>
          <TabsTrigger value="video" className='rounded-full flex-1'>Videos</TabsTrigger>
          <TabsTrigger value="document" className='rounded-full flex-1'>Documents</TabsTrigger>
        </TabsList>
        <div className="min-h-[70vh] w-full">
          <TabsContent value="audio" className="w-full">
            {audioPosts && audioPosts.length > 0 ? renderPosts(audioPosts) : <div className='w-full mt-20 justify-center items-center font-bold text-xl'>No audios available.</div>}
          </TabsContent>
          <TabsContent value="video" className="w-full">
            {videoPosts && videoPosts.length > 0 ? renderPosts(videoPosts) : <div className='w-full mt-20 justify-center items-centerfont-bold text-xl'>No videos available.</div>}
          </TabsContent>
          <TabsContent value="document" className="w-full">
            {documentPosts && documentPosts.length > 0 ? renderPosts(documentPosts) : <div className='w-full mt-20 justify-center items-center font-bold text-xl'>No documents available.</div>}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Preaching;