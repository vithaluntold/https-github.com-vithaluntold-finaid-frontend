import React from "react";
import classNames from "./footer.module.scss";

const Footer = () => {
  return (
    <div className={classNames.footer}>
      <div className={classNames.footerContainer}>
        <div className={classNames.content}>
          {/* <div className={classNames.logo}>FIN(AI)D</div> */}
          <div className={classNames.detailsContainer}>
            <div>
              <div className={classNames.title}>Contact Us</div>
              <div className={classNames.allDetails}>
                <div>
                  Sy 11, Krishe Emerald Kondapur Main Road, Laxmi Cyber City,
                  Whitefields, Kondapur, Hyderabad, Telangana 500081
                </div>
                <div>info@finacegroup.com</div>
                {/* <div>Tel: 123-456-7890</div> */}
              </div>
            </div>
            <div>
              <div className={classNames.title}>Follow Us</div>
              <div className={classNames.allDetails}>
                <div>Instagram</div>
                <div>LinkedIn</div>
                <div>Reddit</div>
                <div>Tiktok</div>
                <div>Facebook</div>
              </div>
            </div>
            <div>
              <div className={classNames.title}>Legal</div>
              <div className={classNames.allDetails}>
                <div>Terms & Conditions</div>
                <div>Privacy Policy</div>
                <div>Accessibility Statement</div>
              </div>
            </div>
          </div>
        </div>
        <div className={classNames.copyRights}>
          <div>Copyright © 2024 Finaid.io</div>
          <div>
            Owned and operated by Futurus FinACE Consulting Private Limited, All
            Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
