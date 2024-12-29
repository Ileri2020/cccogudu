import gitexplore from "../assets/gitexplore.jpg"
import event from "../assets/events2.jpg"
import mernchat from "../assets/mernchat1.jpg"
import nextchat from "../assets/nextjschat.jpg"
import scignite from "../assets/scignite.jpg"
import littlelemon from "../assets/littlelemon.png"
import djsocial from "../assets/djangosocial.jpg"
import uri3 from "../assets/placeholderMale.jpg"



export default {
    title : "Projects",
    projects : [
        {
            domain : "Django",
            title : "Little Lemon app",
            uri : littlelemon,
            description : "This is a project for a newly opened restaurant using Django stack and mysql for database. It was an exercise done during my cousera course",
            repo : ""
        },
        {
            domain : "React",
            title : "Git Explorer",
            uri : gitexplore,
            description : "A frontend app which utilizes github API to query users information. I is a simple app to demonstrate the integration of API calls to web apps.",
            repo : ""
        },
        {
            domain : "MERN stack",
            title : "Chat App",
            uri : mernchat,
            description : "A simple chat app made using MongoDb, Express, React and Nodejs with socketio for asynchronous messaging",
            repo : ""
        },
        {
            domain : "Nextjs",
            title : "Chat App",
            uri : nextchat,
            description : "A simple chat app made using Nextjs for the backend, supabase for authentication and database",
            repo : ""
        },
        {
            domain : "Django",
            title : "Chat App",
            uri : djsocial,
            description : "A simple twitter clone chat app made using django and django channels to implement asynchronous sockets in python",
            repo : ""
        },
        {
            domain : "Nextjs",
            title : "Events",
            uri : event,
            description : "A simple NextJs app just to show events in some locations",
            repo : ""
        },
        {
            domain : "React",
            title : "Science Ignite Africa",
            uri : scignite,
            description : "An app made for a donation foundation, to empower africa into tech",
            repo : ""
        },
    ],
}