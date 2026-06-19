import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Setup Prisma 7 native client
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: true });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface DownloadPageProps {
  params: {
    token: string;
  };
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { token } = params;

  // 1. Look up the purchase by the secure token
  const purchase = await prisma.purchase.findUnique({
    where: { downloadToken: token },
    include: {
      pack: {
        include: {
          files: true, // Fetch the associated PDF files
        },
      },
    },
  });

  // 2. If purchase doesn't exist, show 404
  if (!purchase) {
    notFound();
  }

  // 3. Check if the link has expired (48-hour limit check)
  const isExpired = new Date() > new Date(purchase.expiresAt);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "60px auto", padding: "20px" }}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        
        <h1 style={{ color: "#1b5e20", marginTop: 0, fontSize: "24px" }}>
          Campus Companion Downloads
        </h1>
        <p style={{ color: "#4b5563", fontSize: "14px" }}>
          Verified Buyer: <strong>{purchase.email}</strong>
        </p>

        <hr style={{ border: 0, borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

        {isExpired ? (
          /* Expiry Error Message */
          <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", padding: "16px", borderRadius: "8px", fontSize: "14px" }}>
            <strong>Link Expired:</strong> This secure download access window has closed. Download tokens automatically deactivate 48 hours after payment confirmation. Please contact campus support if you require an extension.
          </div>
        ) : (
          /* Active Downloads List */
          <div>
            <p style={{ fontSize: "15px", color: "##374151" }}>
              Click on the links below to save your official digital Past Question materials:
            </p>

            <div style={{ marginTop: "20px" }}>
              {purchase.pack.files.length === 0 ? (
                <p style={{ color: "#6b7280", fontStyle: "italic", fontSize: "14px" }}>
                  No files are attached to this package bundle yet.
                </p>
              ) : (
                purchase.pack.files.map((file) => (
                  <div 
                    key={file.id} 
                    style={{ display: "flex", justifyContent: "between", alignItems: "center", backgroundColor: "#f9fafb", padding: "14px", borderRadius: "8px", marginBottom: "10px", border: "1px solid #f3f4f6" }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: "#1f2937" }}>
                      {file.title || "Past Question Document"}
                    </span>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ backgroundColor: "#1b5e20", color: "white", padding: "6px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}
                    >
                      Download PDF
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "16px", fontSize: "11px", color: "#9ca3af" }}>
          Transaction Ref: {purchase.reference} • Secure Node Ecosystem
        </div>
      </div>
    </div>
  );
}