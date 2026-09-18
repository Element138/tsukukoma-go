"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocationSelector } from "@/components/location-selector";
import { NavigationView } from "@/components/navigation-view";
import { Switch } from "@/components/ui/switch";
import { maleBathrooms, femaleBathrooms } from "@/components/location-selector";
import { get } from "http";
import { set } from "date-fns";
import Logo from "@/components/logo";
import Footer from "@/components/footer";
import { Metadata } from "next";
import { de } from "date-fns/locale";
import { QrLocationDialog } from "@/components/qr-location-dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type Location = {
  id: string;
  locid: string;
  name: string;
  category: string;
  organizer: string;
  position: string;
  keywords: string[];
};

export default function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isQr = searchParams.get("qr");

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [rainyMode, setRainyMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trueDestination, setTrueDestination] = useState<Location | null>(null);

  const [showBalloon, setShowBalloon] = useState(false);

  const isUpdatingURL = useRef(false);

  const depId = searchParams.get("dep");
  const destId = searchParams.get("dest");
  const rainy = searchParams.get("rainy") === "true";
  const nav = searchParams.get("nav") === "true";

  useEffect(() => {
    if (isQr) {
      setShowBalloon(true);
    }

    const timer = setTimeout(() => {
      setShowBalloon(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isUpdatingURL.current) {
      isUpdatingURL.current = false;
      return;
    }

    // console.warn(destId);

    // If nav=true but missing either dep or dest, redirect to home
    if (nav && (!depId || !destId)) {
      router.replace("/");
      return;
    }

    if (searchParams.has("rainy")) {
      setRainyMode(rainy);
    }

    // Load locations from URL if available
    if (depId || destId) {
      import("@/components/location-selector").then(({ getLocationById }) => {
        let validDep = null;
        let validDest = null;

        if (depId) {
          const dep = getLocationById(depId);
          if (dep) {
            validDep = dep;
            setCurrentLocation(dep);
          }
        }
        if (destId) {
          const dest = getLocationById(destId);
          if (dest) {
            validDest = dest;
            setDestination(dest);
          }
        }

        if (
          (depId && !validDep) ||
          (destId && !validDest) ||
          (depId && destId && depId === destId) ||
          ["m", "f", "169"].includes(depId ?? "") ||
          ["106"].includes(destId ?? "")
        ) {
          router.replace("/");
          router.refresh();
          return;
        }

        // Show navigation if both locations are set and nav=true
        if (nav && validDep && validDest) {
          setShowNavigation(true);
        }
      });
    }
  }, [searchParams, router]);

  const updateURL = (
    newCurrentLocation?: Location | null,
    newDestination?: Location | null,
    newRainyMode?: boolean,
    navigate?: boolean
  ) => {
    isUpdatingURL.current = true;

    const params = new URLSearchParams();

    const currentLoc =
      newCurrentLocation !== undefined ? newCurrentLocation : currentLocation;
    const destLoc = newDestination !== undefined ? newDestination : destination;
    const rainy = newRainyMode !== undefined ? newRainyMode : rainyMode;

    if (currentLoc) params.set("dep", currentLoc.id);
    if (destLoc) params.set("dest", destLoc.id);
    if (rainy) params.set("rainy", "true");
    if (navigate) params.set("nav", "true");

    const url = params.toString() ? `/?${params.toString()}` : "/";
    router.replace(url);
  };

  const handleCurrentLocationChange = (location: Location | null) => {
    setCurrentLocation(location);
    updateURL(location, undefined, undefined, false);
  };

  const handleDetectedLocation = (location: Location, scannedDestination: Location | null) => {
    // A departure cannot also be the destination, including aliases of one map node.
    const nextDestination = scannedDestination ?? (
      destination?.locid === location.locid ? null : destination
    );
    setCurrentLocation(location);
    setDestination(nextDestination);
    updateURL(location, nextDestination, undefined, false);
  };

  const handleDestinationChange = (location: Location | null) => {
    setDestination(location);
    updateURL(undefined, location, undefined, false);
  };

  const handleRainyModeChange = (enabled: boolean) => {
    setRainyMode(enabled);
    updateURL(undefined, undefined, enabled, showNavigation);
  };

  const handleNavigate = () => {
    if (currentLocation && destination) {
      setShowNavigation(true);
      updateURL(undefined, undefined, undefined, true);
    }
  };

  const handleBack = () => {
    setShowNavigation(false);
    updateURL(undefined, undefined, undefined, false);
  };

  useEffect(() => {
    const fetchTrueDestination = async () => {
      if (!currentLocation || !destination) {
        setTrueDestination(null);
        return;
      }

      let actualDestination = destination;

      if (["m", "f"].includes(destination.locid)) {
        const getCost = async (target: Location) => {
          try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
              departure: currentLocation.id,
              destination: target.id,
              rainy: rainyMode.toString(),
            });

            const response = await fetch(`/api/route?${params}`);

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to fetch route");
            }
            const data = await response.json();
            return data.cost;
          } catch (err) {
            console.error("Route fetch error:", err);
            setError(
              err instanceof Error ? err.message : "Failed to load route"
            );
          } finally {
            setLoading(false);
          }
        };

        const candidateBathrooms =
          destination.locid === "m" ? maleBathrooms : femaleBathrooms;
        let best = { closest: candidateBathrooms[0], minCost: Infinity };

        for (const bathroom of candidateBathrooms) {
          const cost = await getCost(bathroom);
          if (cost !== undefined && cost < best.minCost) {
            best = { closest: bathroom, minCost: cost };
          }
        }
        actualDestination = best.closest;
      }
      setTrueDestination(actualDestination);
    };
    fetchTrueDestination();
  }, [
    showNavigation,
    currentLocation,
    destination,
    rainyMode,
    trueDestination,
  ]);

  if (showNavigation && currentLocation && trueDestination) {
    updateURL(currentLocation, trueDestination, rainyMode, true);
    return (
      <NavigationView
        from={currentLocation}
        to={trueDestination}
        onBack={handleBack}
        rainyMode={rainyMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pt-5">
      <Logo />
      <div className="mx-auto max-w-md space-y-8 pt-1">
        {/* <Kagayaki width={80} height={80} /> */}
        <div className="relative space-y-4">
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1">
              <LocationSelector
                label="どこから"
                placeholder="出発地点を選択"
                value={currentLocation}
                departure={true}
                onChange={handleCurrentLocationChange}
              />
            </div>
            <div className="flex pt-7">
              <div className="w-20">
                <QrLocationDialog onSelect={handleDetectedLocation} />
              </div>
            </div>
          </div>

          <LocationSelector
            label="どこまで"
            placeholder="目的地を選択"
            value={destination}
            departure={false}
            onChange={handleDestinationChange}
          />
        </div>

        <button
          onClick={handleNavigate}
          disabled={
            !currentLocation ||
            !destination ||
            currentLocation.locid === destination.locid
          }
          className="relative btn-living-galaxy w-full text-primary-foreground font-bold italic text-8xl px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors overflow-visible"
        >
          <span className="fog fog1" />
          <span className="fog fog2" />
          <span className="fog fog3" />
          {/* <span className="fog fog4" />
          <span className="fog fog5" /> */}
          <span className="-my-4 -ml-4 text-white dark:text-black block">
            GO!
          </span>
        </button>

        <div className="flex items-center justify-center gap-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch
              checked={rainyMode}
              onCheckedChange={handleRainyModeChange}
              className="data-[state=unchecked]:bg-neutral-400 dark:data-[state=unchecked]:bg-neutral-600"
            />
            <span className="text-base font-medium text-blue-600 dark:text-blue-400">
              雨天モード (屋内経路優先)
            </span>
          </label>
        </div>
      </div>
      <Footer />
    </div>
  );
}
