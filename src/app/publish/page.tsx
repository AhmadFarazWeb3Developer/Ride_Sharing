"use client";
import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/inputA";
import { DatePickerDemo } from "../../components/Datepicker";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import { SelectDown } from "@/components/SelectDown";
import { UserContext } from "@/utils/UserProvider";
import { toast } from "react-toastify";
import {  useRouter } from "next/navigation";
import MapComponent from "@/components/MapComponent";
import { publishTransaction } from "@/context/TransactionContext";
import withAuth from "@/components/withAuth";

interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
}
interface Prediction {
  description: string;
  place_id: string;
}

const page = () => {
  const [source, setSource] = React.useState<string>("");
  const [sourceId, setsourceId] = React.useState<string>("");
  const [destinationId, setDestinationId] = React.useState<string>("");
  const [date, setDate] = React.useState(null);
  const [startTime, setstartTime] = React.useState();
  const [endTime, setendTime] = React.useState();
  const [souceTime, setSouceTime] = useState(null);
  const [vehicleId, setvehicleId] = React.useState("");
  const [destinationTime, setDestinantionTime] = useState(null);
  const [destination, setDestination] = React.useState<string>("");
  const [sourcesuggestions, setsourceSuggestions] = React.useState<
    Prediction[]
  >([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    Prediction[]
  >([]);
  const [etherCost, setetherCost] = React.useState<string>("");
  const [allVehicles, setAllVehicles] = useState(null);
  const [distance, setDistance] = useState("");
  const [passengers, setPassengers] = React.useState<string>();
  const [geoLocation, setGeoLocation] = React.useState<GeoLocation>({
    latitude: null,
    longitude: null,
  });
  const sourceInputRef = React.useRef<HTMLInputElement>(null);
  const destinationInputRef = React.useRef<HTMLInputElement>(null);

  const userDataString = localStorage.getItem("userData");

  let username = "";
  if(userDataString === null || userDataString === undefined || userDataString === ""){
    username = "null";
  }
  else
  {
    // console.log("usr",userDataString);
    const userData = JSON.parse(userDataString);
    username = userData.username;
  }
  // if (userDataString !== null) {
  //   const userData = JSON.parse(userDataString);
  //   username = userData.username;
  // } else {
  //   console.error("User data not found in localStorage");
  // }

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGeoLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting geolocation:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };
    getLocation();

    const getAllVehicles = () => {
      axios
        .get(`${process.env.NEXT_PUBLIC_URL}/vehicle/all/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.data.data) {
            setAllVehicles(res.data.data);
          }
        })
        .catch((e) => console.log(e));
    };
    getAllVehicles();
  }, []);

  const handleDestinationSuggestion = (input: string) => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_DB_MAP_URL}?input=${input}&location=${geoLocation.latitude}-${geoLocation.longitude}&radius=5&country=in&key=${process.env.NEXT_PUBLIC_GOOGLEMAP_APIKEY}`
      )
      .then((res) => {
        if (
          res.data &&
          res.data.predictions &&
          res.data.predictions.length > 0
        ) {
          setDestinationSuggestions(res.data.predictions);
        } else {
          console.error("Invalid or unexpected response format");
        }
      })
      .catch((error) => {
        console.error("Error fetching destination data:", error);
      });
  };

  // Handle clicks outside the destination suggestion dropdown
  const handleDestinationClickOutside = (event: any) => {
    if (
      destinationInputRef.current &&
      !destinationInputRef.current.contains(event.target)
    ) {
      setDestinationSuggestions([]);
    }
  };

  // Add event listener for handling clicks outside the destination suggestion dropdown
  useEffect(() => {
    document.addEventListener("click", handleDestinationClickOutside);
    return () =>
      document.removeEventListener("click", handleDestinationClickOutside);
  }, []);

  const Suggestion = (input: string, setSuggestions: any) => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_DB_MAP_URL}?input=${input}&location=${geoLocation.latitude}-${geoLocation.longitude}&radius=5&country=in&key=${process.env.NEXT_PUBLIC_GOOGLEMAP_APIKEY}`
      )
      .then((res) => {
        if (
          res.data &&
          res.data.predictions &&
          res.data.predictions.length > 0
        ) {
          setSuggestions(res.data.predictions);
        } else {
          console.error("Invalid or unexpected response format");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  const handleSourceSuggestion = (e: string) => {
    Suggestion(e, setsourceSuggestions);
  };
  // Handle clicks outside the source suggestion dropdown
  const handleClickOutside = (event: any) => {
    if (
      sourceInputRef.current &&
      !sourceInputRef.current.contains(event.target)
    ) {
      setsourceSuggestions([]);
    }
  };

  useEffect(() => {
    const getlongiLat = (input: string) => {
      axios
        .get(
          `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${input}&key=${process.env.NEXT_PUBLIC_GOOGLEMAP_APIKEY}`
        )
        .then((res) => {
          if (res?.data) {
            setlongiLat({
              latitude: res.data.result.geometry.location.lat,
              longitude: res.data.result.geometry.location.lng,
              label: res.data.result.name,
            });
          } else {
            console.error("Invalid or unexpected response format");
          }
        })
        .catch((error) => {
          console.error("Error fetching destination data:", error);
        });
    };

    const getdestiLongiLat = (input: string) => {
      axios
        .get(
          `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${input}&key=${process.env.NEXT_PUBLIC_GOOGLEMAP_APIKEY}`
        )
        .then((res) => {
          if (res?.data) {
            setdestiLongiLat({
              latitude: res.data.result.geometry.location.lat,
              longitude: res.data.result.geometry.location.lng,
              label: res.data.result.name,
            });
          } else {
            console.error("Invalid or unexpected response format");
          }
        })
        .catch((error) => {
          console.error("Error fetching destination data:", error);
        });
    };

    if (sourceId) {
      getlongiLat(sourceId);
    }

    if (destinationId) {
      getdestiLongiLat(destinationId);
    }
  }, [sourceId, destinationId]);

  useEffect(() => {
    // Add event listener on document mount
    document.addEventListener("click", handleClickOutside);

    // Cleanup function on unmount
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const {token,userData,setlongiLat,setdestiLongiLat} = React.useContext(UserContext);
  const router = useRouter();
  const handleOnPublish = async () => {
    try {
     await publishTransaction(userData.walletAddress);
     await  axios
        .get("https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json", {
          params: {
            destinations: `place_id:${destinationId}`,
            origins: `place_id:${sourceId}`,
            key: process.env.NEXT_PUBLIC_GOOGLEMAP_APIKEY,
            units: "km",
          },
        })
        .then((res) => {
          setDistance(res.data.rows[0].elements[0].distance.text);
        })
        .catch((e) => {
          console.log(e);
        });

     await  axios
        .post(
          `${process.env.NEXT_PUBLIC_URL}/publish`,
          {
            sourceId: sourceId,
            destinationId: destinationId,
            sourceName: source,
            destinationName: destination,
            vehicleId: vehicleId,
            etherCost,
            // distance: distance,
            date: date,
            startTime: souceTime,
            endTime: destinationTime,
            numberOfSeats: passengers,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          console.log(res);
          toast.success("Ride Published Successfully", )
          setDestinantionTime(null);
          setSouceTime(null);
          setDestination("");
          setSource("");
          setetherCost("");
          setvehicleId("");
          setPassengers("");
          setsourceId("");
          setDestinationId("");
          setDate(null);
          router.push("/");
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {/* <div className="flex h-full"> */}
      <div className="h-[93.8vh] bg-[#11184b] ">
        <div className="flex w-full justify-around pt-[20px]">
          <h2 className="font-bold text-[30px]  text-[#FFF]">Publish a Ride</h2>
        </div>

        <div className="flex">
          <div className="flex flex-col gap-[20px] px-[80px] py-[40px]  justify-between items-center">
            <div className="relative w-full  flex gap-5">
              <Input
                value={source}
                ref={sourceInputRef}
                onChange={(e) => {
                  setSource(e?.target?.value);
                  setlongiLat({
                    latitude: null,
                    longitude: null,
                    label: "",
                  });
                  handleSourceSuggestion(e?.target?.value);
                }}
                required
                placeholder="From"
                className="w-[210px]"
              />
              {sourcesuggestions.length > 0 && (
                <div className="absolute max-h-56 overflow-y-auto bg-white z-[100] rounded-md border-2">
                  <ul className="divide-y divide-gray-200">
                    {sourcesuggestions.map((place, index) => (
                      <li
                        className="text-sm p-2.5 cursor-pointer hover:bg-gray-100"
                        key={index}
                        onClick={() => {
                          setSource(place.description);
                          setsourceId(place.place_id);
                          setsourceSuggestions([]);
                        }}
                      >
                        {place.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Input
                value={destination}
                onChange={(e) => {
                  setDestination(e?.target?.value);
                  handleDestinationSuggestion(e?.target?.value);
                  setdestiLongiLat({
                    latitude: null,
                    longitude: null,
                    label: "",
                  });
                }}
                ref={destinationInputRef}
                required
                placeholder="To"
                className="w-[210px]"
              />
              <div className="absolute  w-full">
                <ul>
                  {destinationSuggestions.length > 0 && (
                    <div className="absolute max-h-56 overflow-y-auto bg-white z-[100] rounded-md border-2">
                      <ul className="divide-y divide-gray-200">
                        {destinationSuggestions.map((place, index) => (
                          <li
                            className="text-sm p-2.5 cursor-pointer hover:bg-gray-100"
                            key={index}
                            onClick={() => {
                              setDestination(place.description);
                              setDestinationId(place.place_id);
                              setDestinationSuggestions([]);
                            }}
                          >
                            {place.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </ul>
              </div>
            </div>
            <div className="w-full ">
              <DatePickerDemo   setDate2={setDate} />
              <Input
                type="number"
                required
                value={passengers}
                onChange={(e) => setPassengers(e?.target?.value)}
                placeholder="Passengers"
                className="w-[440px] mt-5"
              />
            </div>
            
            <div className="w-full">
              <SelectDown  setVehicleId={setvehicleId} data={allVehicles} />
            </div>

            <div className="flex   w-full  gap-5">
              <DatePicker
                className={cn(
                  `flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm  file:border-0 file:bg-transparent 
                file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
                focus-visible:outline-none focus-visible:ring-[2px]  focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600
                disabled:cursor-not-allowed disabled:opacity-50
                dark:shadow-[0px_0px_1px_1px_var(--neutral-700)]
                group-hover/input:shadow-none transition duration-400
                `
                )}
                placeholderText="Pick-Up Time"
                selected={souceTime}
                required
                onChange={(time: any) => setSouceTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                dateFormat="h:mm aa"
                timeCaption="Time"
              />
              <DatePicker
                placeholderText="Drop Time"
                className={cn(
                  `flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm  file:border-0 file:bg-transparent 
                file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
                focus-visible:outline-none focus-visible:ring-[2px]  focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600
                disabled:cursor-not-allowed disabled:opacity-50
                dark:shadow-[0px_0px_1px_1px_var(--neutral-700)]
                group-hover/input:shadow-none transition duration-400
                `
                )}
                selected={destinationTime}
                onChange={(time: any) => setDestinantionTime(time)}
                showTimeSelect
                showTimeSelectOnly
                required
                timeIntervals={15}
                dateFormat="h:mm aa"
                timeCaption="Time"
              />
            </div>
            <div className="w-full">
              <Input
                type="number"
                value={etherCost}
                onChange={(e) => setetherCost(e?.target?.value)}
                placeholder="Enter Cost per Passengers"
                className="w-[440px]"
              />
              <Button
                className="mx-auto mt-5 w-[440px] "
                onClick={() => {
                  handleOnPublish();
                }}
                variant="outline"
              >
                Publish
              </Button>
              
            </div>
            
          </div>

          <div className="relative ">
            <MapComponent width='600px' height='500px' />
          </div>

        </div>
        
      </div>
    </>
  );
};

// added
export default page;
