"use client";
import SceneCanvas from "@/scene/SceneCanvas";
import ExperienceController from "@/scene/ExperienceController";
import Hero from "./Hero";
import Capabilities from "./Capabilities";
import SelectedWork from "./SelectedWork";
import AIWorkflow from "./AIWorkflow";
import StackLayers from "./StackLayers";
import EngineeringConsole from "./EngineeringConsole";
import Principles from "./Principles";
import About from "./About";
import ContactCTA from "./ContactCTA";

export default function HomeExperience(){return <><SceneCanvas/><ExperienceController/><main id="main"><Hero/><Capabilities/><SelectedWork/><AIWorkflow/><StackLayers/><EngineeringConsole/><Principles/><About/><ContactCTA/></main></>}