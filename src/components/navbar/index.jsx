import React, { useState } from "react";
import classNames from "./navbar.module.scss";

//assets
import { LuLogIn } from "react-icons/lu";
import logo from "../../assets/images/global/logo.svg";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const history = useHistory();
  const [mobileLinksOpen, setMobileLinksOpen] = useState(false);

  return (
    <div className={classNames.navbar}>
      <div onClick={() => history.push("/")}>
        <img className={classNames.mainLogo} src={logo} alt="logo" />
      </div>
      <div className={classNames.btnsContainer}>
        {location?.pathname?.includes("/marketplace") ||
        location?.pathname?.includes("/execution") ? (
          <>
            <div
              className={classNames.signUpBtn}
              onClick={() => window.open("https://finaceverse.io/registration")}
            >
              Sign Up
            </div>
            <div className={classNames.signInBtn}>Sign In</div>
          </>
        ) : (
          <>
            <div
              className={classNames.manifestBtn}
              onClick={() => window.open("https://finaceverse.io/registration")}
            >
              Sign Up
            </div>
            <div className={classNames.loginBtn}>
              <LuLogIn />
              <span>Login</span>
            </div>
          </>
        )}
      </div>
      <div
        className={classNames.linksMobile}
        // style={{ overflow: mobileLinksOpen ? "" : "hidden" }}
      >
        <div onClick={() => setMobileLinksOpen((prev) => !prev)}>
          <RxHamburgerMenu
            style={{
              opacity: mobileLinksOpen ? 0 : "",
              transform: mobileLinksOpen
                ? "translate(-50%, -50%) rotate(360deg)"
                : "",
            }}
          />
          <IoClose
            style={{
              opacity: !mobileLinksOpen ? 0 : "",
              transform: !mobileLinksOpen
                ? "translate(-50%, -50%) rotate(360deg)"
                : "",
            }}
          />
        </div>
        <div
          className={classNames.linksDropdown}
          style={{
            top: mobileLinksOpen ? "" : "-50px",
            right: mobileLinksOpen ? "" : "-50px",
            height: mobileLinksOpen ? "" : "0",
            width: mobileLinksOpen ? "" : "0",
            opacity: mobileLinksOpen ? "" : "0",
          }}
        >
          <div
            className={classNames.manifestBtn}
            onClick={() => window.open("https://finaceverse.io/registration")}
          >
            Sign Up
          </div>
          <div className={classNames.loginBtn}>
            <LuLogIn />
            <span>Login</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
