import Link from "next/link";
import React from "react";

const Home = () => {
  return <div> 
    <Link href="/dashboard" className="w-full mx-auto mt-40">Dashboard</Link>
  </div>;
};

export default Home;
