import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CivicIssue } from '../types';
import { 
  X, ThumbsUp, ThumbsDown, CheckCircle2, 
  Clock, MapPin, Calendar, Sparkles, ZoomIn,
  Compass, Eye
} from 'lucide-react';

interface IssueDetailSheetProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onVote: (id: string, voteType: 'confirm' | 'reject') => void;
}

export default function IssueDetailSheet({ issue, onClose, onVote }: IssueDetailSheetProps) {
  if (!issue) return null;

  // Toggle state to let user compare the app with and without the 360° virtual view feature
  const [show360Feature, setShow360Feature] = useState(false);
  const [mediaTab, setMediaTab] = useState<'photo' | 'pano'>('photo');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Panorama State
  const [panoAngle, setPanoAngle] = useState(180); // Center angle looking at 180° (where the issue is locked)
  const [panoPitch, setPanoPitch] = useState(0); // Camera pitch angle -38 to +38
  const [timelinePeriod, setTimelinePeriod] = useState<'past' | 'present'>('present');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startAngleRef = useRef(0);
  const startPitchRef = useRef(0);

  // Dynamic colors helper
  const getCategoryColors = () => {
    switch (issue.category) {
      case 'Pothole':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Garbage':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Water Leak':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Broken Infrastructure':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusColors = () => {
    switch (issue.status) {
      case 'Verified':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Resolved':
        return 'bg-teal-500/10 text-teal-600 border-teal-200';
      default: // Reported
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
    }
  };

  const totalVotes = issue.votesConfirm + issue.votesReject;
  const confidencePercent = totalVotes > 0 ? Math.round((issue.votesConfirm / totalVotes) * 100) : 100;

  // Track if they are currently looking at the issue
  let isLookingAtIssue = false;
  let directionText = '';
  let issueDist = 180 - panoAngle;
  if (issueDist < -180) issueDist += 360;
  if (issueDist > 180) issueDist -= 360;

  if (Math.abs(issueDist) < 22) {
    isLookingAtIssue = true;
    directionText = '🎯 Issue in Sight';
  } else {
    directionText = issueDist > 0 
      ? `Rotate ➡ ${Math.round(issueDist)}°` 
      : `Rotate ⬅ ${Math.round(Math.abs(issueDist))}°`;
  }

  // 360° Panorama drawing logic inside useEffect with 3D spherical coordinate projection
  useEffect(() => {
    if (!show360Feature || mediaTab !== 'pano') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp pixel density
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Camera values
    const radPitch = (panoPitch * Math.PI) / 180;
    const fovScale = width * 0.95; // Camera focal length / field of view scale factor

    // 3D perspective projection helper
    // Projects spherical world coordinate around camera to 2D Canvas coordinate
    const project3D = (bearingDeg: number, distance: number, heightOffset: number) => {
      // 1. Calculate relative horizontal heading (Yaw)
      let diffYaw = bearingDeg - panoAngle;
      while (diffYaw < -180) diffYaw += 360;
      while (diffYaw > 180) diffYaw -= 360;

      // Clip if completely behind viewer's field of view
      if (diffYaw < -90 || diffYaw > 90) return null;

      const radYaw = (diffYaw * Math.PI) / 180;

      // 2. Convert world distance/height coordinates into Camera Space (X, Y, Z)
      const rx = distance * Math.sin(radYaw);
      const ry = distance * Math.cos(radYaw);
      const rz = heightOffset;

      // 3. Apply Camera Pitch rotation (up/down tilt) around the perpendicular horizontal X-axis
      const cy = ry * Math.cos(radPitch) - rz * Math.sin(radPitch);
      const cz = -ry * Math.sin(radPitch) + rz * Math.cos(radPitch);

      // Clip behind camera lens
      if (cy <= 0.15) return null;

      // 4. Perspective Division
      const sx = width / 2 + (rx / cy) * fovScale;
      const sy = height / 2 - (cz / cy) * fovScale;
      const scale = fovScale / cy;

      return { x: sx, y: sy, scale };
    };

    // 1. Horizon & Sky/Ground Gradients
    const yHorizon = height / 2 + Math.tan(radPitch) * fovScale;

    // Draw dynamic Night Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, Math.max(0, yHorizon));
    skyGrad.addColorStop(0, '#090d16'); // Dark celestial space
    skyGrad.addColorStop(1, '#1e1b4b'); // Deep twilight violet horizon glow
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, Math.max(0, yHorizon));

    // Draw Ground (Asphalt & Pavement)
    const groundGrad = ctx.createLinearGradient(0, Math.max(0, yHorizon), 0, height);
    groundGrad.addColorStop(0, '#0f172a'); // Distant slate grey asphalt
    groundGrad.addColorStop(1, '#1e293b'); // Near street asphalt highlight
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, Math.max(0, yHorizon), width, height - Math.max(0, yHorizon));

    // 2. Dynamic 3D Celestial Stars (with real parallax scrolling)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const stars = [
      { b: 20, h: 12 }, { b: 45, h: 15 }, { b: 70, h: 11 }, { b: 110, h: 14 },
      { b: 135, h: 10 }, { b: 160, h: 17 }, { b: 190, h: 13 }, { b: 220, h: 15 },
      { b: 250, h: 11 }, { b: 280, h: 16 }, { b: 310, h: 12 }, { b: 340, h: 18 }
    ];
    stars.forEach(star => {
      const proj = project3D(star.b, 50, star.h);
      if (proj) {
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Beautiful Glowing Crescent Moon
    const moonProj = project3D(280, 52, 16);
    if (moonProj) {
      const size = 11 * moonProj.scale;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(moonProj.x, moonProj.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Secondary crescent shadow overlay
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(moonProj.x - size * 0.35, moonProj.y - size * 0.1, size * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Perspective 3D Sidewalk & Road Curb lines
    const draw3DLine = (worldX: number, strokeColor: string, lineWidth: number) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      let first = true;
      for (let d = 3.5; d <= 70; d += 2.5) {
        const bearing = 180 + Math.atan2(worldX, d) * 180 / Math.PI;
        const dist = Math.sqrt(worldX * worldX + d * d);
        const proj = project3D(bearing, dist, -2);
        if (proj) {
          if (first) {
            ctx.moveTo(proj.x, proj.y);
            first = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
      }
      ctx.stroke();
    };

    // Draw Curb lines
    draw3DLine(-4.5, '#334155', 2); // Left curb
    draw3DLine(4.5, '#334155', 2);  // Right curb
    draw3DLine(0, 'rgba(234, 179, 8, 0.38)', 1.5); // Center road divider

    // Sidewalk slabs grid markers
    const drawTransverseSidewalk = (d: number) => {
      const p1_left = project3D(180 + Math.atan2(-8, d) * 180 / Math.PI, Math.sqrt(64 + d*d), -2);
      const p2_left = project3D(180 + Math.atan2(-4.5, d) * 180 / Math.PI, Math.sqrt(20.25 + d*d), -2);
      if (p1_left && p2_left) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1_left.x, p1_left.y);
        ctx.lineTo(p2_left.x, p2_left.y);
        ctx.stroke();
      }

      const p1_right = project3D(180 + Math.atan2(4.5, d) * 180 / Math.PI, Math.sqrt(20.25 + d*d), -2);
      const p2_right = project3D(180 + Math.atan2(8, d) * 180 / Math.PI, Math.sqrt(64 + d*d), -2);
      if (p1_right && p2_right) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1_right.x, p1_right.y);
        ctx.lineTo(p2_right.x, p2_right.y);
        ctx.stroke();
      }
    };
    [4, 8, 12, 16, 22, 30, 42, 58, 80].forEach(d => drawTransverseSidewalk(d));

    // 4. Scenery: Lush 3D Trees with parallax depth
    const draw3DTree = (worldX: number, d: number) => {
      const bearing = 180 + Math.atan2(worldX, d) * 180 / Math.PI;
      const dist = Math.sqrt(worldX * worldX + d * d);
      
      const base = project3D(bearing, dist, -2);
      const top = project3D(bearing, dist, 1.8);
      
      if (base && top) {
        const th = base.y - top.y;
        const tw = th * 0.45;
        
        // Wood Trunk
        ctx.fillStyle = '#451a03';
        ctx.fillRect(base.x - tw * 0.1, top.y + th * 0.4, tw * 0.2, th * 0.6);
        
        // Foliage
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(base.x, top.y + th * 0.35, tw * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(base.x - tw * 0.15, top.y + th * 0.3, tw * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw3DTree(-6, 11);
    draw3DTree(6, 17);
    draw3DTree(-6, 26);
    draw3DTree(6, 38);

    // 5. Scenery: Storefront Buildings
    const draw3DBuilding = (worldX: number, d: number, bWidth: number, bHeight: number, label: string, color: string, glowColor: string) => {
      const bearing = 180 + Math.atan2(worldX, d) * 180 / Math.PI;
      const dist = Math.sqrt(worldX * worldX + d * d);

      const base = project3D(bearing, dist, -2);
      const top = project3D(bearing, dist, -2 + bHeight);

      if (base && top) {
        const bh = base.y - top.y;
        const bw = bh * (bWidth / bHeight);

        ctx.fillStyle = color;
        ctx.fillRect(base.x - bw/2, top.y, bw, bh);

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(base.x - bw * 0.44, top.y + bh * 0.08, bw * 0.88, bh * 0.14);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(6, Math.floor(bw * 0.13))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(label, base.x, top.y + bh * 0.18);

        ctx.fillStyle = glowColor;
        const winW = bw * 0.22;
        const winH = bh * 0.2;
        ctx.fillRect(base.x - bw * 0.32, top.y + bh * 0.32, winW, winH);
        ctx.fillRect(base.x + bw * 0.1, top.y + bh * 0.32, winW, winH);
        ctx.fillRect(base.x - bw * 0.32, top.y + bh * 0.62, winW, winH);
        ctx.fillRect(base.x + bw * 0.1, top.y + bh * 0.62, winW, winH);
      }
    };
    draw3DBuilding(-10.5, 14, 7, 10, 'CIVIC BITES', '#1e293b', '#fde047');
    draw3DBuilding(11, 23, 9, 11, 'LEDGER CAP', '#0f172a', '#38bdf8');

    // 6. RENDER THE REGISTERED CIVIC AUDIT TARGET (bearing 180°)
    const targetDistance = 7.5;
    const issueBase = project3D(180, targetDistance, -2);

    if (issueBase) {
      const scale = issueBase.scale;
      const isResolved = issue.status === 'Resolved';
      ctx.textAlign = 'center';

      if (timelinePeriod === 'past') {
        if (issue.category === 'Pothole') {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2.5 * scale;
          ctx.beginPath();
          ctx.ellipse(issueBase.x, issueBase.y + 4 * scale, 15 * scale, 5 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (issue.category === 'Garbage') {
          ctx.fillStyle = '#065f46';
          ctx.fillRect(issueBase.x - 24 * scale, issueBase.y, 48 * scale, 4 * scale);
        } else if (issue.category === 'Water Leak') {
          ctx.fillStyle = '#374151';
          ctx.fillRect(issueBase.x - 12 * scale, issueBase.y, 24 * scale, 6 * scale);
          ctx.fillStyle = '#111827';
          ctx.fillRect(issueBase.x - 9 * scale, issueBase.y + 1.5 * scale, 18 * scale, 3 * scale);
        } else if (issue.category === 'Broken Infrastructure') {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 4 * scale;
          ctx.beginPath();
          ctx.moveTo(issueBase.x, issueBase.y);
          ctx.lineTo(issueBase.x, issueBase.y - 50 * scale);
          ctx.stroke();

          const glow = ctx.createRadialGradient(issueBase.x, issueBase.y - 50 * scale, 2 * scale, issueBase.x, issueBase.y - 50 * scale, 18 * scale);
          glow.addColorStop(0, 'rgba(253, 224, 71, 0.82)');
          glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(issueBase.x, issueBase.y - 50 * scale, 18 * scale, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        if (issue.category === 'Pothole') {
          if (!isResolved) {
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.ellipse(issueBase.x, issueBase.y + 4 * scale, 18 * scale, 6 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5 * scale;
            ctx.beginPath();
            ctx.ellipse(issueBase.x, issueBase.y + 4 * scale, 21 * scale, 8 * scale, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(issueBase.x - 18 * scale, issueBase.y + 4 * scale); ctx.lineTo(issueBase.x - 25 * scale, issueBase.y + 6 * scale);
            ctx.moveTo(issueBase.x + 18 * scale, issueBase.y + 4 * scale); ctx.lineTo(issueBase.x + 27 * scale, issueBase.y + 1 * scale);
            ctx.stroke();

            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(issueBase.x + 12 * scale, issueBase.y + 8 * scale);
            ctx.lineTo(issueBase.x + 8 * scale, issueBase.y - 12 * scale);
            ctx.lineTo(issueBase.x + 5 * scale, issueBase.y - 12 * scale);
            ctx.lineTo(issueBase.x + 1 * scale, issueBase.y + 8 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(issueBase.x + 4.5 * scale, issueBase.y - 5 * scale, 4 * scale, 4 * scale);
          } else {
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.ellipse(issueBase.x, issueBase.y + 4 * scale, 22 * scale, 7.5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.font = `bold ${Math.max(6, Math.floor(4.5 * scale))}px sans-serif`;
            ctx.fillText('FIXED ✓', issueBase.x, issueBase.y + 5 * scale);
          }
        } else if (issue.category === 'Garbage') {
          if (!isResolved) {
            ctx.fillStyle = '#065f46';
            ctx.beginPath(); ctx.arc(issueBase.x - 8 * scale, issueBase.y + 3 * scale, 8 * scale, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.arc(issueBase.x + 6 * scale, issueBase.y + 4 * scale, 7 * scale, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#78350f';
            ctx.fillRect(issueBase.x - 3 * scale, issueBase.y - 6 * scale, 9 * scale, 10 * scale);
          } else {
            ctx.fillStyle = '#10b981';
            ctx.fillRect(issueBase.x - 6 * scale, issueBase.y - 12 * scale, 12 * scale, 18 * scale);
            ctx.fillStyle = '#047857';
            ctx.fillRect(issueBase.x - 7.5 * scale, issueBase.y - 15 * scale, 15 * scale, 3 * scale);
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(6, Math.floor(7 * scale))}px sans-serif`;
            ctx.fillText('♻', issueBase.x, issueBase.y - 3 * scale);
          }
        } else if (issue.category === 'Water Leak') {
          if (!isResolved) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(issueBase.x - 3.5 * scale, issueBase.y - 12 * scale, 7 * scale, 18 * scale);
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(issueBase.x - 5 * scale, issueBase.y - 8 * scale, 10 * scale, 2.5 * scale);

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5 * scale;
            ctx.beginPath();
            ctx.arc(issueBase.x - 9 * scale, issueBase.y - 5 * scale, 9 * scale, 0, Math.PI, true);
            ctx.stroke();

            ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
            ctx.beginPath();
            ctx.ellipse(issueBase.x, issueBase.y + 6 * scale, 22 * scale, 5 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(issueBase.x - 3.5 * scale, issueBase.y - 12 * scale, 7 * scale, 18 * scale);
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(issueBase.x - 5 * scale, issueBase.y - 8 * scale, 10 * scale, 2.5 * scale);
          }
        } else if (issue.category === 'Broken Infrastructure') {
          if (!isResolved) {
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 3.5 * scale;
            ctx.beginPath();
            ctx.moveTo(issueBase.x + 8 * scale, issueBase.y);
            ctx.lineTo(issueBase.x - 14 * scale, issueBase.y - 52 * scale);
            ctx.stroke();

            const isSpark = Math.floor(Date.now() / 150) % 2 === 0;
            if (isSpark) {
              const glow = ctx.createRadialGradient(issueBase.x - 14 * scale, issueBase.y - 52 * scale, 1 * scale, issueBase.x - 14 * scale, issueBase.y - 52 * scale, 18 * scale);
              glow.addColorStop(0, 'rgba(253, 224, 71, 0.72)');
              glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
              ctx.fillStyle = glow;
              ctx.beginPath(); ctx.arc(issueBase.x - 14 * scale, issueBase.y - 52 * scale, 18 * scale, 0, Math.PI * 2); ctx.fill();
            }
          } else {
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 3.5 * scale;
            ctx.beginPath();
            ctx.moveTo(issueBase.x, issueBase.y);
            ctx.lineTo(issueBase.x, issueBase.y - 55 * scale);
            ctx.stroke();

            const coneGrad = ctx.createLinearGradient(issueBase.x, issueBase.y - 52 * scale, issueBase.x, issueBase.y + 8 * scale);
            coneGrad.addColorStop(0, 'rgba(255, 255, 255, 0.52)');
            coneGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.moveTo(issueBase.x - 2 * scale, issueBase.y - 52 * scale);
            ctx.lineTo(issueBase.x - 24 * scale, issueBase.y + 8 * scale);
            ctx.lineTo(issueBase.x + 24 * scale, issueBase.y + 8 * scale);
            ctx.lineTo(issueBase.x + 2 * scale, issueBase.y - 52 * scale);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // Draw Circular Highlight target pointer
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.ellipse(issueBase.x, issueBase.y + 4 * scale, 22 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Bottom Overlay Instruction Text
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(width / 2 - 100, height - 20, 200, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↔ DRAG IN ANY DIRECTION TO VIEW 360° ↕', width / 2, height - 10);

    // Draw Top Compass HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fillRect(0, 0, width, 22);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(width, 22); ctx.stroke();

    const viewRange = 120;
    const degToPx = width / viewRange;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let deg = -180; deg <= 540; deg += 15) {
      let dist = deg - panoAngle;
      if (dist < -180) dist += 360;
      if (dist > 180) dist -= 360;

      if (Math.abs(dist) <= viewRange / 2) {
        const cx = width / 2 + dist * degToPx;
        const normDeg = (deg + 360) % 360;

        let label = '';
        if (normDeg === 0 || normDeg === 360) label = 'N';
        else if (normDeg === 90) label = 'E';
        else if (normDeg === 180) label = 'S';
        else if (normDeg === 270) label = 'W';
        else if (normDeg % 30 === 0) label = `${normDeg}°`;

        if (label) {
          const isCardinal = label === 'N' || label === 'E' || label === 'S' || label === 'W';
          ctx.fillStyle = isCardinal ? '#38bdf8' : 'rgba(255, 255, 255, 0.55)';
          ctx.font = isCardinal ? 'bold 9.5px monospace' : '7.5px monospace';
          ctx.fillText(label, cx, 11);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.moveTo(cx, 18);
          ctx.lineTo(cx, 22);
          ctx.stroke();
        }
      }
    }

    // Red Center Sight Alignment Tick
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, 22);
    ctx.stroke();

    // Red pointer if targeted issue is on HUD ribbon
    let issueDistAngle = 180 - panoAngle;
    if (issueDistAngle < -180) issueDistAngle += 360;
    if (issueDistAngle > 180) issueDistAngle -= 360;

    if (Math.abs(issueDistAngle) <= viewRange / 2) {
      const targetCx = width / 2 + issueDistAngle * degToPx;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(targetCx - 4.5, 0);
      ctx.lineTo(targetCx + 4.5, 0);
      ctx.lineTo(targetCx, 5);
      ctx.closePath();
      ctx.fill();
    }

  }, [panoAngle, panoPitch, timelinePeriod, mediaTab, issue, show360Feature]);

  // Interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startAngleRef.current = panoAngle;
    startPitchRef.current = panoPitch;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const diffX = e.clientX - startXRef.current;
    const diffY = e.clientY - startYRef.current;

    let newAngle = (startAngleRef.current - diffX * 0.28) % 360;
    if (newAngle < 0) newAngle += 360;
    setPanoAngle(newAngle);

    let newPitch = startPitchRef.current + diffY * 0.24;
    if (newPitch > 35) newPitch = 35;
    if (newPitch < -35) newPitch = -35;
    setPanoPitch(newPitch);
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    startAngleRef.current = panoAngle;
    startPitchRef.current = panoPitch;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const diffX = e.touches[0].clientX - startXRef.current;
    const diffY = e.touches[0].clientY - startYRef.current;

    let newAngle = (startAngleRef.current - diffX * 0.28) % 360;
    if (newAngle < 0) newAngle += 360;
    setPanoAngle(newAngle);

    let newPitch = startPitchRef.current + diffY * 0.24;
    if (newPitch > 35) newPitch = 35;
    if (newPitch < -35) newPitch = -35;
    setPanoPitch(newPitch);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[1000] flex justify-center p-4 sm:p-6 font-sans pointer-events-none select-none">
      {/* Semi-transparent overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1.5px] pointer-events-auto"
        onClick={onClose}
      />

      {/* Detail bottom sheet */}
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-3xl p-5 sm:p-6 overflow-hidden flex flex-col pointer-events-auto animate-slide-up hover:shadow-indigo-100/35">
        
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3.5 shrink-0" />

        {/* Header bar */}
        <div className="flex justify-between items-start gap-4 mb-3 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getCategoryColors()}`}>
                {issue.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase flex items-center gap-1 ${getStatusColors()}`}>
                <Clock className="w-3 h-3" /> {issue.status}
              </span>
              {issue.aiConfidence && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center gap-0.5">
                  🤖 AI: {issue.aiConfidence}%
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-800 font-display tracking-tight leading-none mt-1">
              {issue.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Switching Container + Text Information Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 items-stretch min-h-0">
          
          {/* Left Column: Media layout */}
          <div className="flex flex-col">
            {/* Feature comparison toggle */}
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-100/80 rounded-xl mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span className="text-[9.5px] font-bold text-slate-500 leading-tight">Compare 360° virtual preview</span>
              </div>
              <button
                onClick={() => {
                  setShow360Feature(!show360Feature);
                  setMediaTab('photo');
                }}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                  show360Feature
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{show360Feature ? 'Feature ON' : 'Turn ON'}</span>
              </button>
            </div>

            {/* Tab switchers (only visible if 360 feature preview is active) */}
            {show360Feature && (
              <div className="flex bg-slate-100 p-0.5 rounded-xl mb-2.5 shrink-0 border border-slate-200/40 animate-fade-in">
                <button
                  onClick={() => setMediaTab('photo')}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    mediaTab === 'photo'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Evidence Photo</span>
                </button>
                <button
                  onClick={() => setMediaTab('pano')}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    mediaTab === 'pano'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                      : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>360° Civic view</span>
                </button>
              </div>
            )}

            {/* Media Content Display Box */}
            <div className="relative h-60 sm:h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group flex flex-col">
              {!show360Feature || mediaTab === 'photo' ? (
                /* Original Photo view */
                <div 
                  className="relative w-full h-full cursor-zoom-in group/img overflow-hidden"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={issue.image}
                    alt={issue.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                  {/* Glass hover lightbox tip */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-black gap-1.5 backdrop-blur-xs">
                    <ZoomIn className="w-4 h-4 text-white animate-pulse" />
                    <span>View Full Size Evidence</span>
                  </div>
                  {/* Photo Info Banner */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2.5 text-white pointer-events-none">
                    <p className="text-[9px] font-bold tracking-wide flex items-center gap-1 opacity-90">
                      <Calendar className="w-3 h-3 text-indigo-300" /> Filed {new Date(issue.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] font-black mt-0.5 leading-none">Reporter: {issue.reportedBy}</p>
                  </div>
                </div>
              ) : (
                /* Dynamic Interactive 360° Panorama view */
                <div className="relative w-full h-full flex flex-col overflow-hidden animate-fade-in">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUpOrLeave}
                    className="w-full h-full cursor-grab active:cursor-grabbing shrink-0"
                  />

                  {/* Rotate Sight Guidance Floating Badge */}
                  <div className={`absolute top-7 right-2 px-2 py-0.5 rounded-lg border text-[9px] font-black tracking-wide shadow-md flex items-center gap-1.5 z-10 ${
                    isLookingAtIssue
                      ? 'bg-emerald-500/90 text-white border-emerald-400 animate-pulse'
                      : 'bg-slate-950/75 text-sky-400 border-sky-400/20'
                  }`}>
                    <Compass className={`w-3.5 h-3.5 ${isLookingAtIssue ? 'animate-spin' : ''}`} />
                    <span>{directionText}</span>
                  </div>

                  {/* Interactive timeline slider overlaid */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 z-10 bg-slate-950/75 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/5 shadow-md">
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-indigo-400 animate-pulse" />
                      <span className="text-[8.5px] font-black text-slate-300 uppercase tracking-wider">Audit Time</span>
                    </div>
                    <div className="flex bg-white/10 p-0.5 rounded-lg border border-white/5">
                      <button
                        onClick={() => setTimelinePeriod('past')}
                        className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          timelinePeriod === 'past'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Past (Aug 2025)
                      </button>
                      <button
                        onClick={() => setTimelinePeriod('present')}
                        className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          timelinePeriod === 'present'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Now (June 2026)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Descriptions & Stats */}
          <div className="flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                  Description
                </span>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                  {issue.description}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                  Reported Address
                </span>
                <p className="text-xs font-black text-slate-700 flex items-start gap-1 leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{issue.address || "Bhopal City Area"}</span>
                </p>
              </div>
            </div>

            {/* Verification confidence gauge */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Community Verification
                </span>
                <span className="text-slate-800 font-black">{confidencePercent}% Verified</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${confidencePercent}%` }}
                />
                <div
                  className="bg-rose-400 h-full"
                  style={{ width: `${100 - confidencePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                <span>👍 {issue.votesConfirm} Confirms</span>
                <span>👎 {issue.votesReject} Rejects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voting & Verification */}
        <div className="border-t border-slate-100 pt-4 mt-auto shrink-0 flex flex-col sm:flex-row items-center gap-3">
          {issue.userVoted ? (
            /* Logged State */
            <div className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-500 text-white">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Vote Registered</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    You audited this as {issue.userVoted === 'confirm' ? 'CORRECT' : 'SPAM/INCORRECT'}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg">
                <Sparkles className="w-3 h-3 animate-pulse" /> +2 Trust
              </span>
            </div>
          ) : (
            /* Active Buttons */
            <div className="w-full flex flex-col space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">
                Is this issue currently active at this location?
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => onVote(issue.id, 'confirm')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Confirm (👍)</span>
                </button>
                <button
                  onClick={() => onVote(issue.id, 'reject')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/60 hover:border-rose-100 font-bold rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group cursor-pointer"
                >
                  <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Reject (👎)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox Zoom Overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10005] flex flex-col items-center justify-center bg-slate-950/95 p-4 pointer-events-auto"
          >
            {/* Click backdrop to close */}
            <div 
              className="absolute inset-0 cursor-zoom-out" 
              onClick={() => setIsLightboxOpen(false)} 
            />
            
            {/* Lightbox Header */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10 text-white">
              <div>
                <h4 className="text-sm font-black tracking-tight">{issue.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold">Reported by {issue.reportedBy} • {new Date(issue.timestamp).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image zoom container */}
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-4xl max-h-[75vh] w-full h-full flex items-center justify-center p-2 rounded-2xl overflow-hidden z-0"
            >
              <img
                src={issue.image}
                alt={issue.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5"
              />
            </motion.div>

            {/* Lightbox Footer controls */}
            <div className="absolute bottom-6 flex flex-col items-center gap-1 text-white text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Field Evidence Verification Camera
              </p>
              <p className="text-xs font-semibold text-slate-200">
                Locked GPS Coordinates: {issue.latitude.toFixed(5)}°N, {issue.longitude.toFixed(5)}°E
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide up animation CSS */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0.5;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
