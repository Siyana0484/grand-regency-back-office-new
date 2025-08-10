import React from "react";

// PrintContent.tsx
interface GuestData {
  name: string;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;
  documents?: string[];
}

interface BookingData {
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  grcNumber: string;
  coStayers?: Array<{
    name: string;
    relation?: string;
    dob?: string;
  }>;
}

interface PrintContentProps {
  guestData: GuestData;
  bookingData: BookingData;
}

const PrintContent = React.forwardRef<HTMLDivElement, PrintContentProps>(
  ({ guestData, bookingData }, ref) => {
    return (
      <div ref={ref} className="print-container">
        <style>
          {`
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: 'Times New Roman', serif;
              margin: 0;
              padding: 0;
            }
            .letterhead {
              position: relative;
              height: 120px;
              border-bottom: 2px solid #c0a062;
              margin-bottom: 30px;
            }
            .logo {
              position: absolute;
              left: 50px;
              top: 20px;
              height: 80px;
            }
            .hotel-name {
              position: absolute;
              right: 50px;
              top: 30px;
              text-align: right;
              color: #8b0000;
            }
            .hotel-name h1 {
              font-size: 28px;
              margin: 0;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .hotel-name p {
              margin: 5px 0 0;
              font-size: 14px;
              font-style: italic;
            }
            .content {
              padding: 0 50px;
            }
            .guest-title {
              color: #8b0000;
              border-bottom: 1px solid #c0a062;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .guest-info {
              display: grid;
              grid-template-columns: 150px 1fr;
              gap: 15px;
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #c0a062;
              padding-top: 20px;
              font-size: 12px;
              text-align: center;
              color: #777;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none;
              }
            }
          `}
        </style>

        {/* Letterhead */}
        <div className="letterhead">
          {/* Replace with your actual logo path */}
          <img 
            src="/images/sampleImage.png"
            alt="Grand Regency Logo" 
            className="logo" 
          />
          <div className="hotel-name">
            <h1>GRAND REGENCY</h1>
            <p>Luxury Redefined</p>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          <h2 className="guest-title">GUEST INFORMATION</h2>
          
          <div className="guest-info">
            <span className="label">Full Name:</span>
            <span>{guestData.name || 'N/A'}</span>
            
            <span className="label">Email:</span>
            <span>{guestData.email || 'N/A'}</span>
            
            <span className="label">Phone:</span>
            <span>{guestData.phone || 'N/A'}</span>
            
            <span className="label">Date of Birth:</span>
            <span>
              {guestData.dob ? new Date(guestData.dob).toLocaleDateString() : 'N/A'}
            </span>
            <span className="label">RoomNumber:</span>
            <span>{bookingData.roomNumber || 'N/A'}</span>
             <span className="label">Check-in date:</span>
            <span>{bookingData.checkInDate || 'N/A'}</span>
             <span className="label">Check-out date:</span>
            <span>{bookingData.checkOutDate || 'N/A'}</span>
             <span className="label">grcNumber:</span>
            <span>{bookingData.grcNumber || 'N/A'}</span>
          </div>

          {/* {guestData.documents?.length > 0 && (
            <>
              <h3 style={{ marginTop: '30px', color: '#8b0000' }}>ATTACHED DOCUMENTS</h3>
              <ul style={{ marginTop: '10px' }}>
                {guestData.documents.map((doc, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    {doc.name}
                  </li>
                ))}
              </ul>
            </>
          )} */}
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Grand Regency • 37, West of Chord Road, 1st main road, Shivanagar, Rajajinagar, Bengaluru, Karnataka 560010
             • Phone: +91 8970500500, +91 8310400500</p>
          <p className="no-print">Printed on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  }
);

PrintContent.displayName = "PrintContent";

export default PrintContent;