import { CiLocationOn } from "react-icons/ci";
import { MdOutlineMessage, MdOutlinePhone } from "react-icons/md";


export default {
    title : "contact",
    description : "If you have any questions, inquiries, or would love to worship with us, we would love to hear from you. Please feel free to reach out using the contact information provided below:",
    team : [
        {
            position : "President",
            name : "Deolu Adediran"
        },
        {
            position : "Director of STEM",
            name : "Joshua Ojerinde"
        },
        {
            position : "Public Relations",
            name : "Olamide Akinola"
        },
        {
            position : "Logistics Team Lead",
            name : "Kemi Falola"
        },
        {
            position : "Health and Safety Consultant",
            name : "Bolaji Ogunbunmi"
        },
        {
            position : "Quality Control",
            name : "Favour Akinsanya"
        },
        {
            position : "Information Technology",
            name : "Tolu Thomas"
        },
    ],
    partners : [
        {
            uri : "../assets/alstein.webp",
            name : "ALSTEIN",
        },
        {
            uri : "../assets/adels.webp",
            name : "Adels",
        },
        {
            uri : "../assets/alstein.webp",
            name : "SageIQ",
        },
        {
            uri : "../assets/adels.webp",
            name : "The Vemoye Foundation",
        },
    ],
    contact : [
        {
            icon : <MdOutlineMessage className="w-[40px] h-[40px] text-accent hover:bg-accent hover:text-slate-100 rounded-md bg-transparent border-accent border-2 p-1"/>,
            text : "Chat with us",
            value : "info@cccoguduexpress.com"
        },
        {
            icon : <MdOutlinePhone className="w-[40px] h-[40px] text-accent hover:bg-accent hover:text-slate-100 rounded-md bg-transparent border-accent border-2 p-1"/>,
            text : "Call us",
            value : "+2348169684400"
        },
        {
            icon : <CiLocationOn className="w-[40px] h-[40px] text-accent hover:bg-accent hover:text-slate-100 rounded-md bg-transparent border-accent border-2 p-1"/>,
            text : "Visit us",
            value : "CCC Ogudu express way cathedral, express way, Ogudu, Lagos, Nigeria"
        },
    ]
     
}