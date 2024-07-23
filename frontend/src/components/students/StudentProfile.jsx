import React, { useContext, useState, useEffect } from "react";
import "../../assets/css/studentprofile.css";
import StudentProfileCatalog from "../microcomponents/StudentProfileCatalog";
import StudentInfoFields from "./StudentInfoFields";
import useInput from "../microcomponents/customhooks/useInput";
import { ThemeContext } from "../../context/theme";
import { authContext } from "../../context/authContext";
import { ToastContainer, toast } from "react-toastify";
const baseUrl = "http://localhost:3000"; // dev tests
// const baseUrl = "https://innoduo-honors.onrender.com"; // prod

const StudentProfile = () => {
  const { defaultTheme } = useContext(ThemeContext);
  const {user} = useContext(authContext)
  
  useEffect(() => {
    if (user) {
      resetId(user.studentId);
      resetFirstName(user.firstName);
      resetLastName(user.lastName);
      resetEmail(user.username);
      resetAdvisor(user.advisor);
      resetClassification(user.gradYear);
      resetMajor(user.major);
      resetPhoneNo(user.phoneNo);
    }
  }, [user]);

  console.log("usususu", user);

  const [id, bindId, resetId] = useInput(user?.studentId);
  const [firstName, bindFirstName, resetFirstName] = useInput(user?.firstName);
  const [lastName, bindLastName, resetLastName] = useInput(user?.lastName);
  const [email, bindEmail, resetEmail] = useInput(user?.username + "@caldwell.edu");
  const [advisor, bindAdvisor, resetAdvisor] = useInput(user?.advisor);
  const [classification, bindClassification, resetClassification] = useInput(user?.classification);
  const [major, bindMajor, resetMajor] = useInput(user?.major);
  const [phoneNo, bindPhoneNo, resetPhoneNo] = useInput(user?.phoneNo);

  if (!user) {
    return <div>Loading...</div>;
  }

  const profileSubmitHandler = async (e) => {
    // e.preventDefault();

    const updatedProfile = {
      studentId: id,
      firstName,
      lastName,
      username: email,
      advisor,
      classification,
      major,
      phoneNo,
    };

    console.log(updatedProfile)
    try {
      const response = await fetch(`${baseUrl}/updateProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: id,
          firstName,
          lastName,
          username: email,
          advisor,
          classification,
          major,
          phoneNo,
        }),
      })
      const data = await response.json();
      if (data.message === "profile updated successfully") {
        toast.success("profile updated")
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  return (
    <div className={`page-container ${defaultTheme === "dark" ? "dark-container" : ""}`}>
      <div className="student-info-container">
        <div className="student-name">
          <h2>Student Name</h2>
        </div>
        <div className="student-info-content">
          <form className="student-info-form" onSubmit={profileSubmitHandler}>
            <StudentInfoFields
              bindId={bindId}
              bindFirstName={bindFirstName}
              bindLastName={bindLastName}
              bindEmail={bindEmail}
              bindAdvisor={bindAdvisor}
              bindClassification={bindClassification}
              bindMajor={bindMajor}
              bindPhoneNo={bindPhoneNo}
              disableField={true}
            />
            <div className="primary-btn student-info-update">
              <button type="submit">Update</button>
            </div>
          </form>
        </div>
      </div>
      <div className="student-catalog-container">
        <StudentProfileCatalog />
      </div>
    </div>
  );
};

export default StudentProfile;
