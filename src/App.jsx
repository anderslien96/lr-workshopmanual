import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BASE = "http://127.0.0.1:8765"; // Local server for PDFs only
const MANUAL_JSON_URL = "https://raw.githubusercontent.com/anderslien96/lr-workshopmanual/main/manual_extracted.json";

// ─── MANUAL STRUCTURE ─────────────────────────────────────────────────────────
const SECTIONS = {
  "1": { name: "General Information", icon: "📋", color: "#818cf8" },
  "2": { name: "Chassis",             icon: "🔩", color: "#fb923c" },
  "3": { name: "Powertrain",          icon: "⚙️",  color: "#f87171" },
  "4": { name: "Electrical",          icon: "⚡",  color: "#60a5fa" },
  "5": { name: "Body and Paint",      icon: "🎨", color: "#34d399" },
};

const RAW = [
  ["1","100-00 General info","General Information",[[null,"general service info"],[null,"health & safety precautions"],[null,"how to use this manual"],[null,"important safety instructions"],[null,"road, roller testing"],[null,"solvents sealants & adhesives"],[null,"special tool glossary"],[null,"standard workshop practices"]]],
  ["1","100-00 Index","Index",[[null,"Index"]]],
  ["1","100-01 Identification codes","Identification Codes",[[null,"identification codes"]]],
  ["1","100-02 Jacking  lifting","Jacking and Lifting",[[null,"jacking"],[null,"lifting"],[null,"vehicle recovery"]]],
  ["1","100-03 Maintenance schedules","Maintenance Schedules",[[null,"maintenance schedules"]]],
  ["2","204-00 Suspension general info","Suspension - General Info",[[null,"4 wheel alignment"],[null,"specifications"]]],
  ["2","204-01 Front suspension","Front Suspension",[[null,"description & operation"],[null,"lower arm bushing(60.35.33)"],[null,"lower arm(60.35.02)"],[null,"lower ball joint(60.15.03)"],[null,"shock & spring(60.35.25.99)"],[null,"specs"],[null,"stabilizer bar (60.10.01)"],[null,"stabilizer bar link(60.10.02)"],[null,"upper arm bushing(60.35.32)"],[null,"upper arm(60.35.02)"],[null,"upper ball joint(60.15.02)"],[null,"wheel bearing & hub(60.25.14)"]]],
  ["2","204-02 Rear suspension","Rear Suspension",[[null,"description & operation"],[null,"lower arm bushing("],[null,"lower arm(64.35.54)"],[null,"lower ball joint(64.15.08)"],[null,"shock & spring(64.30.11.99)"],[null,"specs"],[null,"stabilizer bar(64.35.08)"],[null,"stabilizer link (64.35.24)"],[null,"toe link(64.35.70)"],[null,"upper arm bushing(64.35.22)"],[null,"upper arm(64.35.60)"],[null,"upper ball joint(64.15.07)"],[null,"wheel bearing & hub(64.15.14)"],[null,"wheel knuckle(64.35.10)"]]],
  ["2","204-04 Wheels & tires","Wheels and Tires",[[null,"description & operation"],[null,"low pressure sensor(74.10.05)"],[null,"specs"],[null,"tires front antenna(86.53.16)"],[null,"tires rear antenna(86.53.17)"]]],
  ["2","204-05 Vehicle dynamic suspension","Vehicle Dynamic Suspension",[[null,"compressor(60.50.10)"],[null,"description & operation"],[null,"EAS pressurize & depressurize"],[null,"ECM(60.50.04)"],[null,"filter(64.50.12)"],[null,"front air spring(60.21.01.99)"],[null,"front shock (60.30.02.45)"],[null,"front solenoid valve block(60.50.11)"],[null,"height sensor(60.36.01)"],[null,"muffler(64.50.01)"],[null,"pressure sensor"],[null,"rear air spring(64.21.01.99)"],[null,"rear shock(64.30.02.45)"],[null,"rear solenoid valve block(64.50.11)"],[null,"reservoir solenoid vavle block(64.50.11)"],[null,"reservoir(60.50.03)"],[null,"ride height adjustments(60.90.03)"],[null,"specs"]]],
  ["2","204-06 Ride & handling optimization","Ride and Handling",[[null,"ride & handling opt.a"],[null,"switch ride & handling opt."]]],
  ["2","205-01 Driveshafts","Driveshaft",[[null,"driveshaft description & operation"],[null,"front driveshaft R&I(47.15.02)"],[null,"rear driveshaft R&I (47.15.03)"],[null,"specs"],[null,"universal  joints"]]],
  ["2","205-02 Rear drive axle,differential","Rear Axle/Differential",[[null,"axle housing bushing (51.15.41)"],[null,"axle housing support insulator (51.15.44)"],[null,"diff draining and filling"],[null,"diff. lock module(51.30.01)"],[null,"differential locking motor (51.05.03)"],[null,"oil temp sensor (51.15.06)"],[null,"rear axle (51.15.01)"],[null,"rear diff. description & operation"],[null,"specs"]]],
  ["2","205-03 Front drive axle differential","Front Axle/Differential",[[null,"axle assembly (54.10.01)"],[null,"axle carrier bushing (54.10.06)"],[null,"axle tube (47.10.42)"],[null,"front diff description & operation"],[null,"front diff draining and filling"],[null,"housing support insulator (54.10.24)"],[null,"specs"]]],
  ["2","205-04 Front drive halfshafts","Front Halfshafts",[[null,"front halfshafts description & operation"],[null,"halfshaft joint description & operation"],[null,"halfshaft LH (47.10.01)"],[null,"halfshaft RH (47.10.02)"],[null,"inner cv boot (47.10.16)"],[null,"outer cv boot (47.10.03)"],[null,"specs"]]],
  ["2","205-05 Rear drive halfshafts","Rear Halfshafts",[[null,"halfshaft (47.11.01)"],[null,"halfshaft bearing (51.10.29)"],[null,"inner cv joint (47.11.16)"],[null,"outer cv joint (47.11.03)"],[null,"rear halfshafts description & operation"],[null,"specs"]]],
  ["2","206-00 Brakes general info","Brakes - General Info",[[null,"brake bleeding (70.25.02)"],[null,"brake press. bleedl"],[null,"front disc runout check (70.12.15.01)"],[null,"rear disc runout check (70.12.36.01)"],[null,"specs"]]],
  ["2","206-03 Front brake disc","Front Disc Brake",[[null,"brake caliper"],[null,"brake disc"],[null,"brake pads "],[null,"front brake description and operation"],[null,"specs"]]],
  ["2","206-04 Rear brake disc","Rear Disc Brake",[[null,"brake caliper anchor plate"],[null,"brake caliper removal"],[null,"brake disc removal"],[null,"brake pads removal"],[null,"rear disc brake "],[null,"specs"]]],
  ["2","206-05 Parking brake and Actuation","Parking Brake",[[null,"description and operation parking brake"],[null,"parking brake actuator- 2.7diesel"],[null,"parking brake actuator"],[null,"parking brake cable LH removal"],[null,"parking brake cable RH removal"],[null,"parking brake shoe and lining adjustment"],[null,"parking brake shoes bedding-in"],[null,"parking brake switch removal"],[null,"shoes"],[null,"specifications"]]],
  ["2","206-06 Hydraulic Brake Actuation","Hydraulic Brake Actuation",[[null,"brake fluid reservoir removal"],[null,"brake master cylinder removal"],[null,"brake pedal and bracket with auto trans removal"],[null,"brake pedal and bracket with manual trans removal"],[null,"brake pedal with auto trans removal"],[null,"description and operation hydraulic actuation"],[null,"spec"]]],
  ["2","206-07 Power Brake Actuation","Power Brake Actuation",[[null,"brake booster removal"],[null,"brake vacuum pump 27L diesel"],[null,"brake vacuum pump 40L44L"],[null,"description and operation brake booster"],[null,"specs"]]],
  ["2","206-09A Anti-Lock Control- Traction Control","ABS - Traction Control",[[null,"abs module removal"],[null,"description and operation"],[null,"front wheel speed sensor removal"],[null,"rear wheel speed sensor removal"],[null,"specs"]]],
  ["2","206-09B Anti-Lock Control - Stability Assist","ABS - Stability Assist",[[null,"Yaw Rate Sensor"]]],
  ["2","211-00 Steering System- General Info","Steering - General Info",[[null,"description and operation"],[null,"power steer filling and bleeding"]]],
  ["2","211-02 Power Steering","Power Steering",[[null,"description and operation"],[null,"fluid cooler 27L diesel"],[null,"fluid cooler 40L44L removal"],[null,"fluid reservior 27L removal"],[null,"fluid reservior 40L44L removal"],[null,"pressure test 27L diesel"],[null,"pressure test 40L"],[null,"pressure test 44L"],[null,"pump removal 27L diesel"],[null,"Pump removal 40L"],[null,"pump removal 44L"],[null,"specs"],[null,"steering angle sensor removal"],[null,"steering gear removal 27L diesel"],[null,"steering gear removal 40L"],[null,"steering gear removal 44L"]]],
  ["2","211-03 Steering Linkage","Steering Linkage",[[null,"description and operation"],[null,"specs"],[null,"steering gear boot removal"],[null,"tie rod end removal"]]],
  ["2","211-04 Steering Column","Steering Column",[[null,"description and operation"],[null,"specs"],[null,"steering column removal"],[null,"steering column shaft removal"],[null,"steering wheel removal"]]],
  ["2","211-05 Steering Column Switches","Steering Column Switches",[[null,"description and operation"],[null,"ignition switch removal"],[null,"specs"],[null,"steering column lock and ignition switch housing removal"],[null,"steering column multifunciton switch LH removal"],[null,"steering column multifunction switch RH removal"]]],
  ["3","303-00 Engine System General Info","Engine - General Info",[["Diagnosis and Testing","Engine- 27L diesel"],["Diagnosis and Testing","Engine- 40L"],["Diagnosis and Testing","Engine- 44L"],["Genernal Procedures","Bearing Inspection Procedures"],["Genernal Procedures","Camshaft Bearing Journal Clearance"],["Genernal Procedures","Camshaft Bearing Journal Diameter"],["Genernal Procedures","Camshaft End Play"],["Genernal Procedures","Camshaft Surface Inspection"],["Genernal Procedures","Camshart Lobe Lift"],["Genernal Procedures","Connecting Rod Cleaning"],["Genernal Procedures","Connecting Rod Large End Bore"],["Genernal Procedures","Crankshaft End Play"],["Genernal Procedures","Crankshaft Main Bearing Journal Clearance"],["Genernal Procedures","Cylinder Bore Out of Round"],["Genernal Procedures","Cylinder Head Distortion"],["Genernal Procedures","Exhaust Manifold Cleaning and Inspection"],["Genernal Procedures","Piston Inspection"],["Genernal Procedures","Piston Pin Diameter"],["Genernal Procedures","Piston Pin to Bore Diameter"],["Genernal Procedures","Piston Ring End Gap"],["Genernal Procedures","Piston Ring to Groove Clearance"],["Genernal Procedures","Valve Spring Free Length"],["Genernal Procedures","Valve Stem Diameter"]]],
  ["3","303-01A Engine- 4.0L","Engine 4.0L",[[null,"Specificaitons"],["Description and Operation","Engine"],["General Procedures","Camshaft Timing"],["General Procedures","Engine Oil Draining and Filling"],["In Vehicle Repair","Camshaft Drive Cassette LH"],["In Vehicle Repair","Camshaft Drive Cassette RH"],["In Vehicle Repair","Camshaft RH"],["In Vehicle Repair","Camshaft Roller Follower"],["In Vehicle Repair","Crankshaft Front Seal"],["In Vehicle Repair","Crankshaft Pulley"],["In Vehicle Repair","Crankshaft Rear Seal"],["In Vehicle Repair","Cylinder Block Cradle"],["In Vehicle Repair","Cylinder Head LH"],["In Vehicle Repair","Cylinder Head RH"],["In Vehicle Repair","Engine Dynamic Balance Shaft"],["In Vehicle Repair","Engine Front Cover"],["In Vehicle Repair","Engine Mount LH"],["In Vehicle Repair","Engine Mount RH"],["In Vehicle Repair","Exhaust Manifold LH"],["In Vehicle Repair","Exhaust Manifold RH"],["In Vehicle Repair","Flexplate"],["In Vehicle Repair","Hydraulic Timing Chain Tensioner LH"],["In Vehicle Repair","Hydraulic Timing Chain Tensioner RH"],["In Vehicle Repair","Intake Manifold"],["In Vehicle Repair","Jackshaft"],["In Vehicle Repair","Oil Cooler"],["In Vehicle Repair","Oil Pan"],["In Vehicle Repair","Oil Pump"],["In Vehicle Repair","Timing Drive Components"],["In Vehicle Repair","Valve Cover LH"],["In Vehicle Repair","Valve Cover RH"],["Installaiton","Engine"],["Removal","Engine"]]],
  ["3","303-01B Engine- 4.4L","Engine 4.4L",[[null,"Specificaitons"],["Engine","Description and Operation"],["Engine","Installation"],["Engine","Removal"],["General Procedures","Engine Oil Draining and Filling"],["General Procedures","Valve Clearance Adjustment"],["General Procedures","Valve Clearance Check"],["In Vehicle Repairs","Camshafts LH"],["In Vehicle Repairs","Camshafts RH"],["In Vehicle Repairs","Crankshaft Front Seal"],["In Vehicle Repairs","Crankshaft Pulley"],["In Vehicle Repairs","Crankshaft Rear Seal"],["In Vehicle Repairs","Cylinder Head LH"],["In Vehicle Repairs","Engine Front Cover"],["In Vehicle Repairs","Engine Mount LH"],["In Vehicle Repairs","Engine Mount RH"],["In Vehicle Repairs","Exhaust Manifold LH"],["In Vehicle Repairs","Exhaust Manifold RH"],["In Vehicle Repairs","Flexplate"],["In Vehicle Repairs","Oil Cooler"],["In Vehicle Repairs","Oil Pan"],["In Vehicle Repairs","Oil Pump"],["In Vehicle Repairs","Timing Drive Components"],["In Vehicle Repairs","Valve Cover LH"],["In Vehicle Repairs","Valve Cover RH"],["In Vehicle Repairs","Variable Camshaft Timing (VCT) Unit"]]],
  ["3","303-01C Engine- 2.7L Diesel","Engine 2.7L Diesel",[[null,"Engine Description and Operation"],[null,"Engine Oil Draining and Filling"],[null,"Specifications"],["In Vehicle Repair","Camshaft Front Seal"],["In Vehicle Repair","Camshaft Rear Seal"],["In Vehicle Repair","Camshaft RH"],["In Vehicle Repair","Camshafts LH"],["In Vehicle Repair","Crankshaft Front Seal"],["In Vehicle Repair","Crankshaft Rear Seal with Retainer Plate"],["In Vehicle Repair","Cylinder Head LH"],["In Vehicle Repair","Cylinder Head RH"],["In Vehicle Repair","Engine Mount LH"],["In Vehicle Repair","Engine Mount RH"],["In Vehicle Repair","Exhaust Manifold LH"],["In Vehicle Repair","Exhaust Manifold RH"],["In Vehicle Repair","Flexplate"],["In Vehicle Repair","Flywheel"],["In Vehicle Repair","Oil Cooler"],["In Vehicle Repair","Oil filter Housing"],["In Vehicle Repair","Oil Pan"],["In Vehicle Repair","Oil Pressure Switch"],["In Vehicle Repair","Oil Pump Screen and Pickup Tube"],["In Vehicle Repair","Oil Pump"],["In Vehicle Repair","Timing Belt Cover"],["In Vehicle Repair","Timing Belt"],["In Vehicle Repair","Valve Cover LH"],["In Vehicle Repair","Valve Cover RH"],["Installation","Engine- Vehicles with Auto Trans"],["Installation","Engine- Vehicles with Manual Trans"],["Removal","Engine- Vehicles with Auto Trans"],["Removal","Engine- Vehicles with Manual Trans"]]],
  ["3","303-03C Engine Cooling- 2.7L Diesel","Engine Cooling 2.7L Diesel",[[null,"Cooling System Draining Filling Bleeding"],[null,"Cooling System Pressure Test"],[null,"Description and Operation"],[null,"Specifications"],["Removal and Installation","Coolant Expansion Tank"],["Removal and Installation","Coolant Pump"],["Removal and Installation","Cooling Fan Shroud"],["Removal and Installation","Cooling Fan"],["Removal and Installation","Radiator"],["Removal and Installation","Thermostat"]]],
  ["3","303-04C Fuel Charging and Controls- 2.7L","Fuel Charging 2.7L Diesel",[[null,"Description and Operation"],[null,"Specifications"],["Removal and Installation","Fuel Injector"],["Removal and Installation","Fuel Injectors"],["Removal and Installation","Fuel Pump"],["Removal and Installation","Intake Air Shutoff Throttle"]]],
  ["3","303-04D Fuel Charging and Controls- Turbocharger- 2.7 Diesel","Turbocharger 2.7L Diesel",[[null,"Specifications"],[null,"Turbocharger Description and Operation"],[null,"Turbocharger Intake Tube Removal"],[null,"Turbocharger Removal"]]],
  ["3","303-07C Glow Plug System","Glow Plug System",[[null,"Description and Operation"],[null,"Glow Plug Module"],[null,"Glow Plug Relay Removal"],[null,"Glow Plug Removal"],[null,"Specifications"]]],
  ["3","303-08C Engine Emission Control 2.7 Diesel","Emission Control 2.7L Diesel",[[null,"Crankcase Vent Oil Separator Removal"],[null,"Description and Operation"],[null,"Exhaust Gas Recirculation Valve LH Removal"],[null,"Exhaust Gas Recirculation Valve Outlet Tube Removal"],[null,"Exhaust Gas Recirculation Valve RH Removal"],[null,"Specifications"]]],
  ["3","303-14C Electronic Engine Controls- 2.7L Diesel","Electronic Engine Controls 2.7L Diesel",[[null,"Description and Operation"],[null,"Specifications"],["Removal and Installation","Camshaft Position Sensor"],["Removal and Installation","Crankshaft Position Sensor"],["Removal and Installation","Engine Control Module"],["Removal and Installation","Engine Oil Pressure Sensor"],["Removal and Installation","Fuel Rail Pressure Sensor"],["Removal and Installation","Fuel Temperature Sensor"],["Removal and Installation","Oil Temperature Sensor"]]],
  ["3","307-01C Automatic Transmission, Transaxle-2.7L Diesel","Auto Transmission 2.7L Diesel",[[null,"Description and Operation"],[null,"Specifications"],[null,"Transmission Fluid Drain and Refill"],[null,"Transmission Fluid Level Check"],[null,"Transmission Removal and Installation"],["In Vehicle Repairs","Main Control Valve Body"],["In Vehicle Repairs","Output Shaft Seal"],["In Vehicle Repairs","Selector Shaft Seal"]]],
  ["3","308-01 Clutch- 2.7 Diesel","Clutch 2.7L Diesel",[[null,"Clutch Disc and Pressure Plate Removal"],[null,"Description and Operation"],[null,"Pilot Bearing Removal"],[null,"Specifications"]]],
  ["3","308-07A Four-Wheel Drive Systems","Four-Wheel Drive",[[null,"Description and Operation"],[null,"Four-Wheel Drive Control Module Removal"],[null,"High Low Range Sensor Removal"],[null,"Specifications"],[null,"Transfer Case Clutch Solenoid Removal"],[null,"Transfer Case Shift Motor Removal"]]],
  ["3","308-07B Transfer Case","Transfer Case",[[null,"Description and Operation"],[null,"Specifications"],[null,"Transfer Case Draining and Filling"],["In Vehicle Repairs","Transfer Case Input Shaft Seal 2.7L Diesel"],["Installation","Transfer Case 2.7 Diesel"],["Removal","Transfer Case 2.7L Diesel"]]],
  ["4","412-00 Climate Control System- General Info","Climate Control - General",[[null,"Diagnosis and Testing"],[null,"Recovery, Evacuation and Charging"],[null,"Specifications"]]],
  ["4","414-00 Charging System","Charging System",[[null,"Specifications"]]],
  ["4","414-01 Battery, Mounting and Cables","Battery",[[null,"Auxiliary Battery Tray Removal"],[null,"Battery Removal"],[null,"Battery Tray Removal"],[null,"Description adn Operation"],[null,"Specifications"]]],
  ["4","418-00 Module Communications Network","Communications Network",[[null,"Battery Junction Box Removal 4.0L"],[null,"Battery Junction Box Removal 4.4L"],[null,"Central Junction Box Removal"],[null,"Description and Operation"],[null,"Specifications"]]],
  ["4","417-07 Exterior Lighting","Exterior Lighting",[[null,"Adaptive Front Lighting Module Removal"],[null,"Description and Operation"],[null,"Front Fog Lamp Removal"],[null,"Headlamp Adjustment"],[null,"Headlamp Assembly Removal"],[null,"Headlamp Diagnosis"],[null,"Headlamp Switch Removal"],[null,"Specifications"]]],
  ["4","413-13 Parking Aid","Parking Aid",[[null,"Description and Operation"],[null,"Front Inner Sensor Removal"],[null,"Parking Aid Module Removal"],[null,"Parking Aid Speaker Removal"],[null,"Rear Inner Sensor Removal"]]],
  ["5","501-03 Body Closures","Body Closures",[[null,"Fuel Filler Door Assembly"],[null,"Liftgate Alignment"],[null,"Liftgate Removal"]]],
  ["5","501-05 Interior Trim and Ornamentation","Interior Trim",[[null,"A Pillar Removal"],[null,"B Pillar Lower Trim Removal"],[null,"C Pillar Lower Trim Removal"],[null,"Front Door Trim Panel Removal"],[null,"Headliner Removal"],[null,"Rear Door Trim Panel Removal"]]],
  ["5","501-14 Handles, Locks, Latches and Entry Systems","Handles, Locks & Latches",[[null,"Description and Operation"],[null,"Door Lock Cylinder"],[null,"Exterior Front Door Handle"],[null,"Front Door Latch"],[null,"Hood Latch Release Handle"],[null,"Liftgate Latch"],[null,"Specifications"]]],
  ["5","501-16 Wiper and Washers","Wipers and Washers",[[null,"Description and Operation"],[null,"Front Wiper Pivot Arm"],[null,"Rain Sensor"],[null,"Rear Window Wiper Motor"],[null,"Windshield Wiper Motor"]]],
  ["5","501-17 Roof Opening Panel","Roof Opening Panel",[[null,"Description and Operation"],[null,"Roof Opening Panel Alignment"],[null,"Roof Opening Panel Glass"],[null,"Roof Opening Panel Motor"],[null,"Specifications"]]],
  ["5","501-20B Supplemental Restraint System","Supplemental Restraint (Airbags)",[[null,"B-Pillar Side Impact Sensor"],[null,"Clockspring"],[null,"Description and Operation"],[null,"Driver Air Bag Module"],[null,"Passenger Air Bag Module"],[null,"Restraints Control Module"],[null,"Specifications"]]],
  ["5","501-25D Body Repairs- Water Leaks","Water Leaks",[[null,"Water Leaks"]]],
];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are a certified Land Rover Discovery 3 (LR3/Disco 3) specialist mechanic with 20+ years of hands-on experience. You have deep knowledge of every system: electronics, CANbus, air suspension (EAS), engine variants (2.7 TDV6, 4.0 V8, 4.4 V8), drivetrain, and the electrical gremlins this platform is known for.

YOUR STYLE:
- Talk like an experienced mechanic. Direct, conversational, practical.
- Don't dump everything at once. Ask one or two targeted questions, then narrow down.
- Lead with the most common Disco 3 failure pattern for that symptom.
- Real-world language: "the rear nearside height sensor arm — little plastic link, snaps like a twig"
- One diagnosis, one next step, or one key question at a time.
- When you identify the likely fault, ALWAYS suggest which manual section the user should look at, using this format at the end of your message:
  📖 MANUAL: [Section Name] → [Procedure Name]
  For example: 📖 MANUAL: Vehicle Dynamic Suspension → height sensor(60.36.01)
- If a job is genuinely complex, say so plainly.

KEY KNOWLEDGE:

🔵 AIR SUSPENSION / EAS:
1. Compressor failure — worn brushes, relay. Check rear fusebox relay first.
2. Height sensor arms — brittle plastic, snap easily. LEFT=WHITE arm, RIGHT=BLACK.
3. Air bag leaks — soap test, corner valve blocks, worse in cold.
4. Corner valve block — one corner drops, hissing audible.
5. EAS ECU — rule out above first.
T4 calibration REQUIRED after sensor/ASCM work.

🔴 2.7 TDV6 ENGINE:
1. EGR valve/cooler — soot, rough idle, black smoke. Cracked cooler = white smoke = urgent.
2. Turbo actuator VNT — P0299/P0234. Actuator fails before turbo. Check with T4 first.
3. Swirl flaps — blank them on high mileage. Non-negotiable.
4. Injector sealing washers — cold start tick. Copper washers harden.
5. Crank/cam sensor — P0335, P0340. Check loom chafing first.
6. Oil cooler seal — oil into coolant.
7. Timing chain tensioner — cold rattle. Catastrophic if ignored.
HP fuel: wait 30s after engine off. 1650 bar rail pressure.

🟡 ELECTRICAL / CANBUS:
- Weak battery = cascading false faults. Test under load first.
- Ground straps corrosion = bizarre multi-system faults.
- Alternator: 13.8–14.4V at idle.
- Remove BJB fuse 8 before ANY rear brake/EPB work.
- Tailgate loom breaks at hinge — rear lights/sensor faults.
- Sunroof drain blocked → water into A-pillar → fuse corrosion.

🟢 DRIVETRAIN:
- IRD unit — oil seal failure, whine. Shell TF 0753 only.
- Haldex — service filter/oil or 4WD disengages silently.
- Front diff: Castrol SAF-XO. ETM rear diff: Castrol SAF Carbon Mod Plus.
- Halfshaft nut: 350Nm, stake after.

FAULT CODES:
P0299/P0234: VNT actuator | P0335/P0340: Crank/cam or loom | P0401: EGR sooted
C1A0x: EAS height sensor | U0100: CANbus battery/ground | B1A4x: BeCM voltage`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function buildPDFUrl(folder, sub, file) {
  const parts = sub ? `${folder}/${sub}/${file}.pdf` : `${folder}/${file}.pdf`;
  return `${BASE}/${parts.split("/").map(encodeURIComponent).join("/")}`;
}

function buildJsonKey(folder, sub, file) {
  return sub ? `${folder}/${sub}/${file}` : `${folder}/${file}`;
}

function truncateText(text, maxChars = 12000) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n[... procedure continues in PDF ...]";
}

// ─── MESSAGE FORMATTER ───────────────────────────────────────────────────────
function FormatMessage({ text, onManualLink }) {
  const lines = text.split("\n");
  return (
    <div>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;

        const manualMatch = line.match(/📖\s*MANUAL:\s*(.+?)\s*→\s*(.+)/);
        if (manualMatch) {
          return (
            <div key={i} onClick={() => onManualLink && onManualLink(manualMatch[1].trim(), manualMatch[2].trim())}
              style={{ margin: "10px 0", padding: "10px 14px", background: "#1a2a1a", border: "1px solid #34d39944", borderLeft: "3px solid #34d399", borderRadius: 8, cursor: onManualLink ? "pointer" : "default", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>📖</span>
              <div>
                <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, letterSpacing: "0.06em" }}>OPEN IN MANUAL</div>
                <div style={{ fontSize: 13, color: "#e2e8f0", marginTop: 2 }}>
                  <span style={{ color: "#94a3b8" }}>{manualMatch[1].trim()}</span>
                  <span style={{ color: "#475569", margin: "0 6px" }}>→</span>
                  <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{manualMatch[2].trim()}</span>
                </div>
              </div>
              {onManualLink && <span style={{ marginLeft: "auto", color: "#34d399", fontSize: 16 }}>↗</span>}
            </div>
          );
        }

        if (line.startsWith("# ")) return <div key={i} style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", margin: "10px 0 5px" }}>{line.slice(2)}</div>;
        if (line.startsWith("## ")) return <div key={i} style={{ fontWeight: 600, fontSize: 13, color: "#94a3b8", margin: "8px 0 4px" }}>{line.slice(3)}</div>;
        if (line.match(/^\d+\.\s/)) return <div key={i} style={{ paddingLeft: 4, marginBottom: 5, fontSize: 13, color: "#cbd5e1", lineHeight: 1.65 }}>{renderInline(line)}</div>;
        if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: 10, marginBottom: 4, fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>• {renderInline(line.slice(2))}</div>;

        return <div key={i} style={{ marginBottom: 4, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? <strong key={i} style={{ color: "#f1f5f9", fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p
  );
}

// ─── AI CHAT PANEL ────────────────────────────────────────────────────────────
function AIChatPanel({ prefill, onPrefillConsumed, onManualLink, manualData, onClose }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Alright, let's sort out your Disco 3.\n\nTell me what it's doing — warning lights, noises, when it happens, mileage if you know it. The more detail, the faster we'll pin it down.\n\nOr browse the manual on the left and hit **Ask AI** on any procedure to get hands-on guidance for that specific job.`
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    if (prefill) {
      setInput(prefill.text || "");
      onPrefillConsumed();
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [prefill]);

  const send = async (overrideText, overridePdfKey) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      let systemPrompt = BASE_SYSTEM_PROMPT;
      if (overridePdfKey && manualData && manualData[overridePdfKey]) {
        const pdfText = truncateText(manualData[overridePdfKey]);
        systemPrompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nWORKSHOP MANUAL PROCEDURE (from official LR manual):\n${pdfText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThe user is looking at this exact procedure. Give specific, step-by-step guidance based on the manual text above. Highlight Disco 3 specific gotchas, required tools, and torque specs from the procedure.`;
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: next.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.map(b => b.text || "").join("\n") || "No response.";
      setMessages(p => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setError("Connection failed — check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => send();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#080c14" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e2440", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: "#0d1220" }}>
        <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#34d399,#059669)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🔧</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", letterSpacing: "0.02em" }}>AI Mechanic</div>
          <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>Reads your manual · Knows the Disco 3</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 20, padding: "0 4px", lineHeight: 1, borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
          onMouseLeave={e => e.currentTarget.style.color = "#334155"}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 3 }}>
            <div style={{ fontSize: 9, color: "#1e3a5f", fontWeight: 700, letterSpacing: "0.1em", paddingLeft: m.role === "assistant" ? 3 : 0, paddingRight: m.role === "user" ? 3 : 0 }}>
              {m.role === "user" ? "YOU" : "MECHANIC"}
            </div>
            <div style={{
              maxWidth: "92%",
              background: m.role === "user" ? "#111827" : "#0d1525",
              border: `1px solid ${m.role === "user" ? "#1e3a5f" : "#1a2535"}`,
              borderLeft: m.role === "assistant" ? "3px solid #34d399" : undefined,
              borderRight: m.role === "user" ? "3px solid #6366f1" : undefined,
              borderRadius: m.role === "user" ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
              padding: "11px 14px",
            }}>
              {m.role === "assistant"
                ? <FormatMessage text={m.content} onManualLink={onManualLink} />
                : <div style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{m.content}</div>
              }
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
            <div style={{ fontSize: 9, color: "#1e3a5f", fontWeight: 700, letterSpacing: "0.1em", paddingLeft: 3 }}>MECHANIC</div>
            <div style={{ background: "#0d1525", border: "1px solid #1a2535", borderLeft: "3px solid #34d399", borderRadius: "2px 12px 12px 12px", padding: "14px 16px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 160, 320].map(d => (
                <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", animation: "mechPulse 1.4s ease-in-out infinite", animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "#1a0808", border: "1px solid #ef444430", color: "#ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 12, lineHeight: 1.5 }}>
            ⚠️ {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 14px 14px", borderTop: "1px solid #1a2535", background: "#0d1220", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={loading}
            rows={2}
            placeholder="Describe the problem, paste a fault code, or ask about a procedure…"
            style={{ flex: 1, background: "#080c14", border: "1px solid #1a2535", borderRadius: 10, color: "#e2e8f0", fontSize: 13, padding: "10px 13px", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.55, transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#34d39966"}
            onBlur={e => e.target.style.borderColor = "#1a2535"}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            style={{ width: 44, height: 44, background: input.trim() && !loading ? "#34d399" : "#1a2535", border: "none", borderRadius: 10, cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input.trim() && !loading ? "#fff" : "#334155"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#1e2a3a", textAlign: "center", marginTop: 8, letterSpacing: "0.05em" }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [search, setSearch] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [manualData, setManualData] = useState(null);
  const [manualLoading, setManualLoading] = useState(true);
  const [manualError, setManualError] = useState(false);
  const [highlightedPdf, setHighlightedPdf] = useState(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    fetch(MANUAL_JSON_URL)
      .then(r => {
        if (!r.ok) throw new Error("Not reachable");
        return r.json();
      })
      .then(data => { setManualData(data); setManualLoading(false); })
      .catch(() => { setManualError(true); setManualLoading(false); });
  }, []);

  const bySection = useMemo(() => {
    const m = {};
    RAW.forEach(([sec, folder, label, files]) => {
      if (!m[sec]) m[sec] = [];
      m[sec].push({ folder, label, files });
    });
    return m;
  }, []);

  const totalPDFs = RAW.reduce((a, r) => a + r[3].length, 0);
  const secInfo = selectedSection ? SECTIONS[selectedSection] : null;
  const folderData = selectedFolder ? RAW.find(r => r[1] === selectedFolder) : null;

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const res = [];
    RAW.forEach(([sec, folder, label, files]) => {
      files.forEach(([sub, file]) => {
        if (file.toLowerCase().includes(q) || label.toLowerCase().includes(q) || (sub || "").toLowerCase().includes(q)) {
          res.push({ sec, folder, label, sub, file });
        }
      });
    });
    return res.slice(0, 60);
  }, [search]);

  const handleManualLink = useCallback((sectionLabel, procedureName) => {
    const match = RAW.find(([, , label]) =>
      label.toLowerCase().includes(sectionLabel.toLowerCase()) ||
      sectionLabel.toLowerCase().includes(label.toLowerCase())
    );
    if (match) {
      const [sec, folder] = match;
      setSearch("");
      setSelectedSection(sec);
      setSelectedFolder(folder);
      setHighlightedPdf(procedureName.toLowerCase());
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
    }
  }, []);

  const askAI = useCallback((text, pdfKey) => {
    setPrefill({ text, pdfKey });
    setAiOpen(true);
  }, []);

  const AskBtn = ({ folder, sub, file, label, small }) => {
    const jsonKey = buildJsonKey(folder, sub, file);
    const hasContent = manualData && !!manualData[jsonKey];
    return (
      <button
        onClick={e => {
          e.stopPropagation();
          const promptText = hasContent
            ? `I'm about to do the "${file}" procedure from the "${label}" section of the Discovery 3 workshop manual. Walk me through the key steps, any special tools needed, torque specs, and Disco 3-specific gotchas I should know before starting.`
            : `I'm looking at the "${file}" procedure in the "${label}" section of the Discovery 3 manual. What should I know about this job?`;
          askAI(promptText, hasContent ? jsonKey : null);
        }}
        style={{
          fontSize: small ? 10 : 11,
          padding: small ? "3px 7px" : "4px 10px",
          background: hasContent ? "#34d39918" : "#1a253518",
          border: `1px solid ${hasContent ? "#34d39944" : "#1e254044"}`,
          borderRadius: 6,
          color: hasContent ? "#34d399" : "#475569",
          cursor: "pointer",
          fontWeight: 600,
          letterSpacing: "0.04em",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = hasContent ? "#34d399" : "#334155"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = hasContent ? "#34d39918" : "#1a253518"; e.currentTarget.style.color = hasContent ? "#34d399" : "#475569"; }}
      >
        {hasContent ? "🔧 Ask AI" : "💬 Ask AI"}
      </button>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#060a12", height: "100vh", color: "#e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @keyframes mechPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.25;transform:scale(1.5)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2440; border-radius: 2px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {manualError && (
        <div style={{ background: "#1a0a00", borderBottom: "1px solid #fb923c44", padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#fb923c" }}>
          <span>⚠️</span>
          <span>Could not load manual data from GitHub.</span>
        </div>
      )}

      <div style={{ background: "#0a0f1e", borderBottom: "1px solid #111827", padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#34d399,#059669)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔧</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", letterSpacing: "0.01em" }}>Land Rover Discovery 3 — Workshop Manual</div>
          <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>
            {manualLoading ? "Loading manual data…" : manualError ? "Failed to load manual data" : `${totalPDFs} procedures · ${Object.keys(manualData || {}).length} with AI content · 5 sections`}
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#0c1220", border: `1px solid ${manualError ? "#ef444430" : "#34d39930"}`, borderRadius: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: manualError ? "#ef4444" : manualLoading ? "#f59e0b" : "#34d399", boxShadow: manualError ? "0 0 6px #ef4444" : "0 0 6px #34d399" }} />
            <span style={{ fontSize: 11, color: manualError ? "#ef4444" : manualLoading ? "#f59e0b" : "#34d399", fontWeight: 600 }}>
              {manualError ? "Load failed" : manualLoading ? "Loading…" : "Manual loaded"}
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#334155", pointerEvents: "none" }}>🔍</span>
            <input
              placeholder="Search any procedure…"
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) { setSelectedSection(null); setSelectedFolder(null); } }}
              style={{ background: "#0c1220", border: "1px solid #111827", borderRadius: 8, padding: "8px 14px 8px 34px", color: "#e2e8f0", fontSize: 13, width: 240, outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#34d39966"}
              onBlur={e => e.target.style.borderColor = "#111827"}
            />
          </div>

          <button onClick={() => setAiOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: aiOpen ? "#34d399" : "#0c1a14", border: `1px solid ${aiOpen ? "#34d399" : "#34d39940"}`, borderRadius: 8, color: aiOpen ? "#052e16" : "#34d399", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s", letterSpacing: "0.02em" }}>
            <span style={{ fontSize: 15 }}>🤖</span>
            <span>AI Mechanic</span>
            {!aiOpen && <span style={{ fontSize: 10, background: "#34d39920", border: "1px solid #34d39940", borderRadius: 4, padding: "1px 5px", color: "#34d399" }}>reads your manual</span>}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 215, background: "#080c14", borderRight: "1px solid #111827", padding: "14px 8px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#1e2a3a", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10, paddingLeft: 8 }}>Sections</div>
          <div onClick={() => { setSelectedSection(null); setSelectedFolder(null); setSearch(""); }}
            style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 3, background: !selectedSection && !search ? "#111827" : "transparent", color: !selectedSection && !search ? "#f1f5f9" : "#475569", fontSize: 13, transition: "all 0.15s" }}>
            All Sections
          </div>
          {Object.entries(SECTIONS).map(([k, v]) => (
            <div key={k}>
              <div onClick={() => { setSelectedSection(selectedSection === k ? null : k); setSelectedFolder(null); setSearch(""); }}
                style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: selectedSection === k ? "#111827" : "transparent", color: selectedSection === k ? "#f1f5f9" : "#475569", fontSize: 13, borderLeft: selectedSection === k ? `3px solid ${v.color}` : "3px solid transparent", transition: "all 0.15s" }}>
                {v.icon} {v.name}
              </div>
              {selectedSection === k && (bySection[k] || []).map(({ folder, label }) => (
                <div key={folder} onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                  style={{ padding: "5px 10px 5px 22px", borderRadius: 6, cursor: "pointer", marginBottom: 1, background: selectedFolder === folder ? "#0d1a2e" : "transparent", color: selectedFolder === folder ? "#93c5fd" : "#334155", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "all 0.15s" }}>
                  {label}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {search && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
                {searchResults.length} results for "<span style={{ color: "#f1f5f9" }}>{search}</span>"
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8 }}>
                {searchResults.map((r, i) => {
                  const sv = SECTIONS[r.sec];
                  const jsonKey = buildJsonKey(r.folder, r.sub, r.file);
                  const hasContent = manualData && !!manualData[jsonKey];
                  return (
                    <div key={i} style={{ background: "#0a0f1e", border: "1px solid #111827", borderRadius: 10, padding: "13px 14px", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = sv.color + "88"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#111827"}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", flex: 1, lineHeight: 1.4 }}>{r.file}</div>
                        <AskBtn folder={r.folder} sub={r.sub} file={r.file} label={r.label} small />
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, background: sv.color + "20", color: sv.color, borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>{sv.icon} {sv.name}</span>
                        <span style={{ fontSize: 10, color: "#475569", borderRadius: 4, padding: "2px 7px", background: "#111827" }}>{r.label}</span>
                        {hasContent && <span style={{ fontSize: 10, color: "#34d39966", padding: "2px 6px" }}>● AI has this</span>}
                      </div>
                      <button onClick={() => window.open(buildPDFUrl(r.folder, r.sub, r.file), "_blank")}
                        style={{ fontSize: 11, color: "#334155", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                        📄 Open PDF ↗
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!search && !selectedSection && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Workshop Manual</div>
                <div style={{ fontSize: 13, color: "#334155" }}>Browse all sections, or use the AI Mechanic to diagnose a problem first.</div>
              </div>
              {!aiOpen && (
                <div onClick={() => setAiOpen(true)}
                  style={{ background: "#0a1a10", border: "1px solid #34d39930", borderRadius: 12, padding: "16px 20px", marginBottom: 24, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#34d39966"; e.currentTarget.style.background = "#0c1f14"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#34d39930"; e.currentTarget.style.background = "#0a1a10"; }}>
                  <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#34d399,#059669)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🔧</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#34d399" }}>Got a problem? Start here.</div>
                    <div style={{ fontSize: 12, color: "#334155", marginTop: 3 }}>Describe your symptoms to the AI Mechanic — it reads your manual and helps you diagnose.</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: "#34d399", fontSize: 20 }}>→</div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 12 }}>
                {Object.entries(SECTIONS).map(([k, v]) => {
                  const count = (bySection[k] || []).reduce((a, r) => a + r.files.length, 0);
                  return (
                    <div key={k} onClick={() => setSelectedSection(k)}
                      style={{ background: "#0a0f1e", border: "1px solid #111827", borderRadius: 14, padding: "20px 16px", cursor: "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = v.color + "88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.transform = "none"; }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${v.color}, ${v.color}88)` }} />
                      <div style={{ fontSize: 28, marginBottom: 12 }}>{v.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 8, lineHeight: 1.3 }}>{v.name}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: v.color, lineHeight: 1 }}>{count}</div>
                      <div style={{ fontSize: 11, color: "#334155", marginTop: 3 }}>procedures · {(bySection[k] || []).length} subsections</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!search && selectedSection && !selectedFolder && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 18, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ cursor: "pointer" }} onClick={() => setSelectedSection(null)}>All Sections</span>
                <span style={{ color: "#1e2a3a" }}>›</span>
                <span style={{ color: "#f1f5f9" }}>{secInfo.icon} {secInfo.name}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: 10 }}>
                {(bySection[selectedSection] || []).map(({ folder, label, files }) => (
                  <div key={folder} onClick={() => setSelectedFolder(folder)}
                    style={{ background: "#0a0f1e", border: "1px solid #111827", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = secInfo.color + "88"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#111827"}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 3, lineHeight: 1.4 }}>{label}</div>
                    <div style={{ fontSize: 10, color: "#334155", marginBottom: 10 }}>{folder.split(" ")[0]}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, color: secInfo.color, fontWeight: 700 }}>{files.length} procedures</div>
                      <button onClick={e => { e.stopPropagation(); askAI(`I need help with the "${label}" system on my Discovery 3. What are the most common failure points and symptoms?`, null); }}
                        style={{ fontSize: 10, padding: "3px 8px", background: "#34d39915", border: "1px solid #34d39940", borderRadius: 5, color: "#34d399", cursor: "pointer", fontWeight: 600 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#34d399"; e.currentTarget.style.color = "#052e16"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#34d39915"; e.currentTarget.style.color = "#34d399"; }}>
                        💬 Ask AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!search && selectedSection && selectedFolder && folderData && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 18, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ cursor: "pointer" }} onClick={() => setSelectedSection(null)}>All Sections</span>
                <span style={{ color: "#1e2a3a" }}>›</span>
                <span style={{ cursor: "pointer" }} onClick={() => setSelectedFolder(null)}>{secInfo.icon} {secInfo.name}</span>
                <span style={{ color: "#1e2a3a" }}>›</span>
                <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{folderData[2]}</span>
              </div>
              {(() => {
                const groups = {};
                folderData[3].forEach(([sub, file]) => {
                  const key = sub || "—";
                  if (!groups[key]) groups[key] = [];
                  groups[key].push({ sub, file });
                });
                return Object.entries(groups).map(([grp, items]) => (
                  <div key={grp} style={{ marginBottom: 24 }}>
                    {grp !== "—" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 3, height: 16, background: secInfo.color, borderRadius: 2 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: secInfo.color, textTransform: "uppercase", letterSpacing: 1 }}>{grp}</span>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))", gap: 7 }}>
                      {items.map(({ sub, file }, idx) => {
                        const jsonKey = buildJsonKey(selectedFolder, sub, file);
                        const hasContent = manualData && !!manualData[jsonKey];
                        const isHighlighted = highlightedPdf && file.toLowerCase().includes(highlightedPdf);
                        return (
                          <div key={idx} ref={isHighlighted ? highlightRef : null}
                            style={{ background: isHighlighted ? secInfo.color + "15" : "#0a0f1e", border: `1px solid ${isHighlighted ? secInfo.color : secInfo.color + "20"}`, borderRadius: 10, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = secInfo.color; e.currentTarget.style.background = secInfo.color + "12"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = isHighlighted ? secInfo.color : secInfo.color + "20"; e.currentTarget.style.background = isHighlighted ? secInfo.color + "15" : "#0a0f1e"; }}>
                            <div style={{ width: 28, height: 28, background: secInfo.color + "20", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>📄</div>
                            <div style={{ flex: 1, fontSize: 12, color: "#e2e8f0", fontWeight: 500, minWidth: 0, lineHeight: 1.4 }}>
                              {file}
                              {hasContent && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#34d399", marginLeft: 6, verticalAlign: "middle", opacity: 0.7 }} />}
                            </div>
                            <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
                              <AskBtn folder={selectedFolder} sub={sub} file={file} label={folderData[2]} small />
                              <button onClick={() => window.open(buildPDFUrl(selectedFolder, sub, file), "_blank")}
                                style={{ width: 28, height: 28, background: "none", border: `1px solid ${secInfo.color}30`, borderRadius: 6, cursor: "pointer", color: secInfo.color, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = secInfo.color + "20"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                                title="Open PDF">↗</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {aiOpen && (
          <div style={{ width: 390, borderLeft: "1px solid #111827", flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeIn 0.2s ease" }}>
            <AIChatPanel
              prefill={prefill}
              onPrefillConsumed={() => setPrefill(null)}
              onManualLink={handleManualLink}
              manualData={manualData}
              onClose={() => setAiOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
