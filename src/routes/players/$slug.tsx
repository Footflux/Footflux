import {createFileRoute,redirect} from "@tanstack/react-router";
export const Route=createFileRoute("/players/$slug")({beforeLoad:({params})=>{throw redirect({to:"/explore/$type/$slug",params:{type:"player",slug:params.slug}})}});
