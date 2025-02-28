import { useState } from "react";
import { ethers } from "ethers";
import DocumentVerifier from "./DocumentVerifier.json";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { computeFileHash } from "./hashUtils";

const contractAddress = "0xDa493C7b01e06D0a76F14b835565506F9834c33d";

const IssueCertificate = () => {
  const [studentAddress, setStudentAddress] = useState("");
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState(null);
  const [docHash, setDocHash] = useState("");

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    const hash = await computeFileHash(selectedFile);
    setDocHash(hash);
  };

  const issueCertificate = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is required!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, DocumentVerifier.abi, signer);

      const tx = await contract.issueDocument(studentAddress, docName, docHash);
      await tx.wait();

      await addDoc(collection(db, "certificates"), {
        student: studentAddress,
        name: docName,
        hash: docHash,
        issuedAt: new Date()
      });

      toast.success("Certificate Issued!");
    } catch (error) {
      toast.error("Error issuing certificate");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Issue Certificate</h2>
      <input type="text" placeholder="Student Address" onChange={(e) => setStudentAddress(e.target.value)} />
      <input type="text" placeholder="Document Name" onChange={(e) => setDocName(e.target.value)} />
      <input type="file" onChange={handleFileChange} />
      <p>Computed Hash: {docHash}</p>
      <button onClick={issueCertificate}>Issue</button>
    </div>
  );
};

export default IssueCertificate;
