"use client";
import { FormEvent, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export default function ContactPage(){
  const [state,setState]=useState<"idle"|"sending"|"success"|"error">("idle");
  const [message,setMessage]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setState("sending");setMessage("");const form=new FormData(e.currentTarget);const payload=Object.fromEntries(form.entries());try{const res=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();if(!res.ok)throw new Error(data.error||"Unable to submit the form.");setState("success");setMessage(data.message);}catch(error){setState("error");setMessage(error instanceof Error?error.message:"Unable to submit the form.");}}
  return <main id="main" className="inner-page contact-page"><div className="shell"><div className="page-kicker"><span>CONTACT / 01</span><span>PROJECT BRIEF</span></div><div className="contact-layout"><div><h1>Start a<br/><span>conversation.</span></h1><p>Tell me what you&apos;re trying to make, automate or improve. Keep it rough; the useful details can come next.</p><div className="contact-notes"><span>GOOD INPUT</span><p>The problem, who it is for, what exists today, and what “working” would look like.</p></div></div><form onSubmit={submit} noValidate><input className="hp-field" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" />
    <label>Name<input name="name" required minLength={2} maxLength={80} autoComplete="name"/></label>
    <label>Email<input name="email" required type="email" maxLength={160} autoComplete="email"/></label>
    <label>What are you building?<textarea name="brief" required minLength={20} maxLength={3000} rows={7}/></label>
    <label>Budget / scope <span>OPTIONAL</span><input name="budget" maxLength={120}/></label>
    <button className="button button-primary" disabled={state==="sending"}>{state==="sending"?"Sending…":"Send project brief"}<ArrowUpRight size={17}/></button>
    {message&&<p className={`form-message ${state}`} role="status">{message}</p>}
  </form></div></div></main>
}
