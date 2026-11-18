import "server-only";
import type {VerifiedPayment} from "./complete";
import {paymentReceipt} from "./receipt-content";
/** Base-14 fonts keep a small, dependency-free receipt. Monetary values use explicit NGN. */
function text(value:string){return value.replace(/₦/g,"NGN ").replace(/[–—]/g,"-").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/×/g,"x").replace(/[^\x20-\xFF]/gu,c=>c.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^\x20-\xFF]/g,"?")).replace(/([\\()])/g,"\\$1");}
function wrap(value:string,width=72){const lines:string[]=[];for(const original of value.split("\n")){let line="";for(const word of original.split(/\s+/)){if(line.length+word.length+1>width&&line){lines.push(line);line=""}for(let i=0;i<word.length;i+=width){const chunk=word.slice(i,i+width);if(i>0){lines.push(line);line=""}line+=(line?" ":"")+chunk;}}lines.push(line);}return lines;}
/** PDF drawing uses text operators only; customer strings cannot inject PDF instructions. */
export function receiptPdf(payment:Extract<VerifiedPayment,{status:"paid"}>):Buffer{
 const lines=wrap(paymentReceipt(payment).text);const chunks:string[][]=[];for(let i=0;i<lines.length;i+=40)chunks.push(lines.slice(i,i+40));
 const objects:string[]=["<< /Type /Catalog /Pages 2 0 R >>","", "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"];
 for(let i=0;i<chunks.length;i++){
  const pageId=5+i*2,contentId=pageId+1;
  let stream="1 1 1 rg 0 0 595 842 re f\n0.04 0.19 0.15 rg 36 752 523 54 re f\nBT /F2 18 Tf 1 1 0.95 rg 48 774 Td (ROCK-TAMA | "+(payment.test?"TEST RECEIPT":"PAYMENT RECEIPT")+") Tj ET\n";
  stream+="0.07 0.09 0.08 rg BT /F1 11 Tf 16 TL 48 728 Td\n"+chunks[i].map(line=>`(${text(line)}) Tj T*`).join("\n")+"\nET\n";
  stream+=`BT /F1 9 Tf 48 40 Td (Page ${i+1} of ${chunks.length} | ${text(payment.reference)}) Tj ET`;
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
  objects.push(`<< /Length ${Buffer.byteLength(stream,"latin1")} >>\nstream\n${stream}\nendstream`);
 }
 objects[1]=`<< /Type /Pages /Kids [${chunks.map((_,i)=>`${5+i*2} 0 R`).join(" ")}] /Count ${chunks.length} >>`;
 let pdf="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";const offsets=[0];
 objects.forEach((object,i)=>{offsets.push(Buffer.byteLength(pdf,"latin1"));pdf+=`${i+1} 0 obj\n${object}\nendobj\n`});
 const start=Buffer.byteLength(pdf,"latin1");pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(offset=>`${String(offset).padStart(10,"0")} 00000 n \n`).join("")+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
 return Buffer.from(pdf,"latin1");
}
