import Data from "./Data"
import React from 'react';
import Card from "./Card";

const Courses=()=> {
  return (
 <>
 <div className="my-5">
 <h1 className="text-center">Our Courses</h1>
 </div>
 <div className="container-fluid mb-5">
 <div className="row">
 <div className="col-10 mx-auto">
 <div className="row gy-4">
 
 {
Data.map((val,ind)=>{
    return <Card
    key={ind}
    imgsrc={val.imgsrc}
    title={val.title}
    content={val.content}

    />
})

 }
     </div>
 </div>
 </div>
 </div>
 </>
  );
}

export default Courses;
