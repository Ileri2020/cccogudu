"use server"
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();



export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const model = searchParams.get("model") || null;
  const search = searchParams.get("search") || null; // new search param
  const id = searchParams.get("id") || null;

  const prismaModelMap = {
    ministries: prisma.ministry,
    departments: prisma.department,
    users: prisma.user,
    comments: prisma.comment,
    likes: prisma.like,
    billboards: prisma.billboard,
    posts: prisma.post,
    bible: prisma.bible,
    meetings: prisma.meeting,
    playlists: prisma.playlist,
  };

  const prismaModel = prismaModelMap[model];

  if (!prismaModel) {
    return new Response(JSON.stringify({ message: "invalid model" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // If id is provided, fetch single record
    if (id) {
      const item = await prismaModel.findUnique({ where: { id } });
      if (!item)
        return new Response(JSON.stringify({ error: "Document not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      return new Response(JSON.stringify(item), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If model is posts and search is provided, filter by title
    if (model === "posts" && search) {
      const items = await prisma.post.findMany({
        where: {
          title: { contains: search, mode: "insensitive" }, // case-insensitive
        },
        include: { user: { select: { name: true, username: true, email: true } } },
      });
      return new Response(JSON.stringify(items), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Otherwise fetch all records
    const items = await prismaModel.findMany();
    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch items" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}




export async function POST(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  // const formData = await req.formData
  // const file = formData.
  
  // Destructure and provide defaults
  const model = searchParams.get('model') || null;
  const id = searchParams.get('id') || null;
  // const body = searchParams.get('body') || null;

  // Parse JSON body
  let body = null;
  try {
    body = await req.json(); // This reads the JSON payload
  } catch (err) {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { method } = req; 
  console.log("in db handler",model, id, method, body)


  const modelMap = {
    ministries: prisma.ministry,
    departments: prisma.department,
    users: prisma.user,
    comments: prisma.comment,
    likes: prisma.like,
    billboards: prisma.billboard,
    posts: prisma.post,
    bible: prisma.bible,
    meetings : prisma.meeting,
    playlists : prisma.playlist,
  };

  const prismaModel = modelMap[model];

  if (!prismaModel) {
    console.log("in prisma model check function")
    return new Response(JSON.stringify({message : "invalid model"}), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  
  try {
    let data = body;


    if (model === 'users') {
      try {
        const hashedPassword = await bcrypt.hash(data.password, parseInt(process.env.SALT_ROUNDS));
        data.password = hashedPassword;
        console.log("hashed password", hashedPassword)
      } catch (error) {
        console.error('Error hashing password:', error);
        return new Response(JSON.stringify({ message: 'Error hashing password' }), { status: 500, headers: { 'Content-Type': 'application/json' }, });
      }
    }
    
    


    console.log("form body:", data)
    const newItem = await prismaModel.create({
      data,
    });

    return new Response(JSON.stringify(newItem), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to POST items' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

}




export async function PUT(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  
    // Destructure and provide defaults
    const model = searchParams.get('model') || null;
    const id = searchParams.get('id') || null;
    // const body = searchParams.get('body') || null;
  
    // Parse JSON body
    let body = null;
    try {
      body = await req.json(); // This reads the JSON payload
    } catch (err) {
      return new Response('Invalid JSON', { status: 400 });
    }

  const { method } = req; 
  console.log("in db handler",model, id, method, body)


  const modelMap = {
    ministries: prisma.ministry,
    departments: prisma.department,
    users: prisma.user,
    comments: prisma.comment,
    likes: prisma.like,
    billboards: prisma.billboard,
    posts: prisma.post,
    bible: prisma.bible,
    meetings : prisma.meeting,
    playlists : prisma.playlist,
  };

  const prismaModel = modelMap[model];

  if (!prismaModel) {
    console.log("in prisma model check function")
    return new Response(JSON.stringify({message : "invalid model"}), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

    // ✏️ Update Object
  try {
    const { id, ...updatedata } = body;
    console.log("id removed from :", updatedata)
    const updatedItem = await prismaModel.update({
      where: {id},
      data: updatedata,
    });

    return new Response(JSON.stringify(updatedItem), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database update error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to UPDAT/PUT item' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

}




export async function DELETE(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  
  // Destructure and provide defaults
  const model = searchParams.get('model') || null;
  const id = searchParams.get('id') || null;
  console.log("in db handler",model, id)


  const modelMap = {
    ministries: prisma.ministry,
    departments: prisma.department,
    users: prisma.user,
    comments: prisma.comment,
    likes: prisma.like,
    billboards: prisma.billboard,
    posts: prisma.post,
    bible: prisma.bible,
    meetings : prisma.meeting,
    playlists : prisma.playlist,
  };

  const prismaModel = modelMap[model];

  if (!prismaModel) {
    console.log("in prisma model check function")
    return new Response(JSON.stringify({message : "invalid model"}), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

    // ❌ Delete Object
  try {
    await prismaModel.delete({
      where: { id },
    });
    return new Response(JSON.stringify({success : true}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database DELETE error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to DELETE items' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }
}































