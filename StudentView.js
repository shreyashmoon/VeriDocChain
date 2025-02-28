import { useState, useEffect } from "react";
import { ethers } from "ethers";
import DocumentVerifier from "./DocumentVerifier.json";
import { computeFileHash } from "./hashUtils";

const contractAddress = "0xDa493C7b01e06D0a76F14b835565506F9834c33d";

const StudentView = () => {
  const [documents, setDocuments] = useState([]);
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [computedHash, setComputedHash] = useState("");
  const [verificationResult, setVerificationResult] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const contract = new ethers.Contract(contractAddress, DocumentVerifier.abi, provider);
      const result = await contract.getStudentDocuments(accounts[0]);
      setDocuments(result);
    };

    fetchDocuments();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const hash = await computeFileHash(selectedFile);
    setComputedHash(hash);
  };

  const verifyDocument = () => {
    if (!computedHash) {
      setVerificationResult("Please upload a document first.");
      return;
    }

    const matched = documents.some((doc) => doc.documentHash === computedHash);
    setVerificationResult(matched ? "✅ Document is Authentic!" : "❌ Document is NOT Authentic!");
  };

  return (
    <div>
      <h2>Your Documents</h2>
      {documents.length === 0 ? (
        <p>No documents found</p>
      ) : (
        <ul>
          {documents.map((doc, index) => (
            <li key={index}>
              <strong>{doc.name}</strong> - {doc.documentHash}
            </li>
          ))}
        </ul>
      )}

      <h2>Verify Your Document</h2>
      <input type="file" onChange={handleFileChange} />
      <p>Computed Hash: {computedHash}</p>
      <button onClick={verifyDocument}>Verify</button>
      <p>{verificationResult}</p>
    </div>
  );
};

export default StudentView;
