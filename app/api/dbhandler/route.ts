"use server"
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();



export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  
  // Destructure and provide defaults
  const model = searchParams.get('model') || null;
  const id = searchParams.get('id') || null;
  const body = searchParams.get('body') || null;

  const { method } = req; 
  console.log("in db handler",model, id, method, body)


  const modelMap = {
    ministries: prisma.ministry,
    departments: prisma.department,
    books: prisma.book,
    users: prisma.user,
    comments: prisma.comment,
    likes: prisma.like,
    billboards: prisma.billboard,
    posts: prisma.post,
  };

  const prismaModel = modelMap[model];

  if (!prismaModel) {
    console.log("in prisma model check function")
    return new Response(JSON.stringify({message : "invalid model"}), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  
  if (id == null){
    try {
      const items = await prismaModel.findMany();
      return new Response(JSON.stringify(items), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch items' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }else{
    if(model === "likes" || model === "comments"){
      try {
        const item = await prismaModel.findMany({
          where: {
            contentId: id,
          },
        });
        
        // if (!item) return new Response(
        //   JSON.stringify({ error: 'Document not found' }),
        //   { status: 405, headers: { 'Content-Type': 'application/json' } }
        // );
        console.log(item)
        return new Response(JSON.stringify(item), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch items' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }


    try {
        const item = await prismaModel.findUnique({
          where: { id },
        });

        if (!item) return new Response(
          JSON.stringify({ error: 'Document not found' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );

        return new Response(JSON.stringify(item), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch items' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
      }
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
    books: prisma.book,
    users: prisma.user,
    comments: prisma.comment,
    likes: prisma.like,
    billboards: prisma.billboard,
    posts: prisma.post,
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
    const data = body;
    console.log("form body:", body)
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
    books: prisma.book,
    users: prisma.user,
    comments: prisma.comment,
    likes: prisma.like,
    billboards: prisma.billboard,
    posts: prisma.post,
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
    books: prisma.book,
    users: prisma.user,
    comments: prisma.comment,
    likes: prisma.like,
    billboards: prisma.billboard,
    posts: prisma.post,
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































