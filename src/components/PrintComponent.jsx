import React from "react";
// import Page2 from "./Page2"; // Impor Page2
import styles from "./PrintPage.module.css"; // Mengimpor CSS Module

const PrintComponent = () => {
  const printPage2 = () => {
    const printArea = document.getElementById("page2"); // Ambil konten Page2
    const originalContent = document.body.innerHTML;

    // Ganti body dengan konten yang ingin dicetak
    document.body.innerHTML = printArea.outerHTML;

    // Panggil window.print() untuk mencetak
    window.print();

    // Setelah pencetakan, kembalikan body ke keadaan semula
    document.body.innerHTML = originalContent;
  };

  return (
    <div>
      <div className="h-1" id="page2">
        <p>This is the content of Page 2 that will be printed.</p>
      </div>
      <h1>Page 1</h1>
      <button onClick={printPage2}>Print Page 2</button>
    </div>
  );
};

export default PrintComponent;
