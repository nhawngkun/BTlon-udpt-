/* eslint-disable react/prop-types */

import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config";

const Card = ({ item }) => {

  
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    const handleAdmin = async () => {
      try {
        const userInfo = localStorage.getItem("User");
        if (!userInfo) return; // Không có user, không gọi API

        const user = JSON.parse(userInfo);
        if (!user?.id) return;

        const res = await axios.get(
          `${API_URL}/user/profile/${user.id}`
        );
        console.log("User role in card:", res.data.role);
        
        // Kiểm tra cả "Admin" và "admin"
        if (res.data.role && (res.data.role.toLowerCase() === "admin")) {
          setAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin role in card:", error);
      }
    }
    handleAdmin()
  }, [])


  return (
    <>
      <div className="mt-2 p-0 lg:p-4">
        <div className="card w-90 shadow-md bg-base-300 hover:scale-105 duration-200 dark:bg-slate-900 dark:text-white dark:border">
          <figure className="mt-3">
            <img
              className="w-55 h-60"
              src={item.image}
              alt="Books" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              {item.name}
              <div className="badge badge-secondary">{item.category}</div>
            </h2>
            <p>{item.title}</p>
            <div className="card-actions justify-between mt-1">
              <div className="badge badge-outline p-4 cursor-pointer hover:bg-pink-500 duration-200 hover:text-black">{item.lang}</div>
              <div className="flex space-x-2">
                <Link
                  to={`/read/${item.id}`} // Changed from item._id to item.id
                  className="badge badge-outline p-4 cursor-pointer hover:bg-pink-500 duration-200 hover:text-black">
                  Read Online
                </Link>
                {item.link && (
                  <a
                    href={item.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="badge badge-outline p-4 cursor-pointer hover:bg-blue-500 duration-200 hover:text-black">
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

export default Card;
