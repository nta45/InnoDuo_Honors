import React from "react";
import stuCatalog from "../../assets/test-json"

const StudentProfileCatalog = () => {
  return (
    <div className="catalog-container">
        <h3 className="user-name">Exact Student Name Catalog</h3>
      <div className="catalog-contents">

        {
            console.log(stuCatalog)
        }

<table>
    <tbody>
        {
            stuCatalog.map((cat)=>(
                <div className="catalog-layout catalog-box">
                    <div className="catalog-catogary catalog-box">{cat.cat1.catName}</div>

                <div className="catalog-content catalog-box" key={cat.cat1.catName}>
                <label className="catagory-title">{cat.cat1.class1.className }</label>
                <div className="catagory-lists">{cat.cat1.class1.semester.FA24.s001} </div>
                </div>
            </div>
            ))
        }
    </tbody>
</table>
        {/* <div className="catalog-content">
                <label className="catagory-title">Honors Seminar</label>
                <div className="catagory-lists"></div>
            </div>
            <div className="catalog-content">
                <label className="catagory-title">Honors Core Classes</label>
                <div className="catagory-lists"></div>
            </div>
            <div className="catalog-content">
                <label className="catagory-title">Freshman Seminar</label>
                <div className="catagory-lists"></div>
            </div>
            <div className="catalog-content">
                <label className="catagory-title">Research Methodology</label>
                <div className="catagory-lists"></div>
            </div>
            <div className="catalog-content">
                <label className="catagory-title">Honors Project</label>
                <div className="catagory-lists"></div>
            </div>
            <div className="catalog-content">
                <label className="catagory-title">CRACAD Presentation</label>
                <div className="catagory-lists"></div>
            </div>
            <div className="catalog-content">
                <label className="catagory-title">Service Events</label>
                <div className="catagory-lists"></div>
            </div> */}
      </div>
    </div>
  );
};

export default StudentProfileCatalog;
