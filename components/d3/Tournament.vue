<template>
    <div ref="container" class="w-full h-full">
        <svg ref="svg" class="w-full h-full"></svg>
    </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3';

// Types
interface Match {
    id: string;
    round: number;
    match: number;
    team1: string;
    team2: string;
    winner?: string;
    score1?: number;
    score2?: number;
    team1Code?: string;
    team2Code?: string;
}

interface TournamentProps {
    matches: Match[];
    roundTitles?: string[];
}

interface MatchPosition {
    x: number;
    y: number;
}

interface TeamPathInfo {
    matchId: string;
    round: number;
    matchNumber: number;
}

// Props
const props = defineProps<TournamentProps>();

// Refs
const container = ref<HTMLElement | null>(null);
const svg = ref<SVGElement | null>(null);
let resizeObserver: ResizeObserver;

// Constants
const MATCH_BOX_WIDTH_RATIO = 0.9;
const MATCH_BOX_HEIGHT_RATIO = 0.9;
const MARGIN_RATIO = 0.05;
const CORNER_RADIUS = 10;
const JOIN_POINT_RATIO = 0.6;
const LINE_THICKNESS = 1.5;
const LINE_THICKNESS_DIM = 0.8;
const OPACITY_DIM = 0.3;
const FLAG_WIDTH = 18;
const FLAG_HEIGHT = 12;
const TEXT_PADDING = 22;
const FONT_WEIGHT = {
    winner: "bold",
    loser: "normal"
};
const TITLE_MARGIN_TOP = 20;
const TITLE_FONT_SIZE = 14;

// Default round titles
const DEFAULT_ROUND_TITLES = [
    "Round of 16", 
    "Quarter-Finals", 
    "Semi-Finals", 
    "Final"
];

// Colors
const COLORS = {
    winner: {
        background: '#dcfce7',
        text: '#059669'
    },
    loser: {
        background: '#f3f4f6',
        text: '#4b5563'
    },
    border: '#d1d5db'
};

// Track team paths
const teamPaths = new Map<string, TeamPathInfo[]>();

// Calculate team paths
const calculateTeamPaths = () => {
    teamPaths.clear();
    
    props.matches.forEach(match => {
        // Add match to team1's path
        if (!teamPaths.has(match.team1)) {
            teamPaths.set(match.team1, []);
        }
        teamPaths.get(match.team1)?.push({
            matchId: match.id,
            round: match.round,
            matchNumber: match.match
        });
        
        // Add match to team2's path
        if (!teamPaths.has(match.team2)) {
            teamPaths.set(match.team2, []);
        }
        teamPaths.get(match.team2)?.push({
            matchId: match.id,
            round: match.round,
            matchNumber: match.match
        });
    });
};

// Find connections between matches for a team
const findTeamConnections = (team: string): { source: string, target: string }[] => {
    const connections: { source: string, target: string }[] = [];
    const teamMatches = teamPaths.get(team);
    
    if (!teamMatches || teamMatches.length <= 1) return connections;
    
    const sortedMatches = [...teamMatches].sort((a, b) => a.round - b.round);
    
    for (let i = 0; i < sortedMatches.length - 1; i++) {
        const current = sortedMatches[i];
        const currentMatch = props.matches.find(m => m.id === current.matchId);
        
        if (!currentMatch || currentMatch.winner !== team) continue;
        
        for (let j = i + 1; j < sortedMatches.length; j++) {
            const next = sortedMatches[j];
            if (next.round === current.round + 1) {
                connections.push({
                    source: current.matchId,
                    target: next.matchId
                });
                break;
            }
        }
    }
    
    return connections;
};

// Calculate match positions
const calculateMatchPositions = (width: number, height: number, margin: number, roundWidth: number, matchHeight: number): Map<string, MatchPosition> => {
    const positions = new Map<string, MatchPosition>();
    const maxRound = Math.max(...props.matches.map(m => m.round));
    
    // Calculate first round positions
    const firstRoundMatches = props.matches.filter(m => m.round === 0);
    const firstRoundStartY = (height - (firstRoundMatches.length * matchHeight)) / 2;
    
    firstRoundMatches.forEach((match, index) => {
        positions.set(match.id, {
            x: margin + match.round * roundWidth,
            y: firstRoundStartY + index * matchHeight
        });
    });

    // Calculate subsequent round positions
    for (let round = 1; round <= maxRound; round++) {
        const currentRoundMatches = props.matches.filter(m => m.round === round);
        currentRoundMatches.forEach(match => {
            const prevMatch1 = props.matches.find(m => m.round === round - 1 && m.match === match.match * 2);
            const prevMatch2 = props.matches.find(m => m.round === round - 1 && m.match === match.match * 2 + 1);
            
            if (prevMatch1 && prevMatch2) {
                const pos1 = positions.get(prevMatch1.id);
                const pos2 = positions.get(prevMatch2.id);
                
                if (pos1 && pos2) {
                    positions.set(match.id, {
                        x: margin + round * roundWidth,
                        y: (pos1.y + pos2.y) / 2
                    });
                }
            }
        });
    }

    return positions;
};

// Add flag image to SVG
const addFlag = (
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    countryCode: string,
    x: number,
    y: number,
    team: string
) => {
    const flagUrl = `/img/countries/${countryCode.toLowerCase()}.svg`;
    
    group.append("image")
        .attr("x", x)
        .attr("y", y - FLAG_HEIGHT / 2)
        .attr("width", FLAG_WIDTH)
        .attr("height", FLAG_HEIGHT)
        .attr("href", flagUrl)
        .attr("data-team", team)
        .on("mouseenter", () => highlightTeamPath(team))
        .on("mouseleave", () => resetHighlight());
};

// Draw a single match box
const drawMatchBox = (matchGroup: d3.Selection<SVGGElement, unknown, null, undefined>, match: Match, boxWidth: number, boxHeight: number) => {
    matchGroup.attr("data-match-id", match.id);
    
    const teamHeight = boxHeight / 2;

    [0, 1].forEach((index) => {
        const isWinner = index === 0 ? match.winner === match.team1 : match.winner === match.team2;
        const colors = isWinner ? COLORS.winner : COLORS.loser;

        matchGroup.append("rect")
            .attr("y", index * teamHeight)
            .attr("width", boxWidth)
            .attr("height", teamHeight)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", colors.background)
            .attr("stroke", COLORS.border)
            .attr("stroke-width", 1)
            .attr("data-team", index === 0 ? match.team1 : match.team2)
            .on("mouseenter", (event) => highlightTeamPath(event.target.getAttribute("data-team")))
            .on("mouseleave", () => resetHighlight());
    });

    // Team 1 info
    const team1Group = matchGroup.append("g")
        .attr("transform", `translate(10, ${teamHeight / 2})`)
        .attr("data-team", match.team1);

    // Add flag for team1 if country code exists
    const hasTeam1Flag = !!match.team1Code;
    const textX = hasTeam1Flag ? TEXT_PADDING : 0;
    
    if (hasTeam1Flag) {
        addFlag(team1Group, match.team1Code!, 0, 0, match.team1);
    }
    
    // Add team name with font-weight based on winner
    const isTeam1Winner = match.winner === match.team1;
    team1Group.append("text")
        .attr("x", textX)
        .attr("dy", "0.32em")
        .attr("fill", isTeam1Winner ? COLORS.winner.text : COLORS.loser.text)
        .attr("font-weight", isTeam1Winner ? FONT_WEIGHT.winner : FONT_WEIGHT.loser)
        .attr("data-team", match.team1)
        .on("mouseenter", (event) => highlightTeamPath(event.target.getAttribute("data-team")))
        .on("mouseleave", () => resetHighlight())
        .text(match.team1);

    if (match.score1 !== undefined) {
        team1Group.append("text")
            .attr("x", boxWidth - 30)
            .attr("dy", "0.32em")
            .attr("fill", isTeam1Winner ? COLORS.winner.text : COLORS.loser.text)
            .attr("font-weight", isTeam1Winner ? FONT_WEIGHT.winner : FONT_WEIGHT.loser)
            .attr("text-anchor", "end")
            .attr("data-team", match.team1)
            .on("mouseenter", (event) => highlightTeamPath(event.target.getAttribute("data-team")))
            .on("mouseleave", () => resetHighlight())
            .text(match.score1.toString());
    }

    // Team 2 info
    const team2Group = matchGroup.append("g")
        .attr("transform", `translate(10, ${teamHeight * 1.5})`)
        .attr("data-team", match.team2);

    // Add flag for team2 if country code exists
    const hasTeam2Flag = !!match.team2Code;
    const team2TextX = hasTeam2Flag ? TEXT_PADDING : 0;
    
    if (hasTeam2Flag) {
        addFlag(team2Group, match.team2Code!, 0, 0, match.team2);
    }
    
    // Add team name with font-weight based on winner
    const isTeam2Winner = match.winner === match.team2;
    team2Group.append("text")
        .attr("x", team2TextX)
        .attr("dy", "0.32em")
        .attr("fill", isTeam2Winner ? COLORS.winner.text : COLORS.loser.text)
        .attr("font-weight", isTeam2Winner ? FONT_WEIGHT.winner : FONT_WEIGHT.loser)
        .attr("data-team", match.team2)
        .on("mouseenter", (event) => highlightTeamPath(event.target.getAttribute("data-team")))
        .on("mouseleave", () => resetHighlight())
        .text(match.team2);

    if (match.score2 !== undefined) {
        team2Group.append("text")
            .attr("x", boxWidth - 30)
            .attr("dy", "0.32em")
            .attr("fill", isTeam2Winner ? COLORS.winner.text : COLORS.loser.text)
            .attr("font-weight", isTeam2Winner ? FONT_WEIGHT.winner : FONT_WEIGHT.loser)
            .attr("text-anchor", "end")
            .attr("data-team", match.team2)
            .on("mouseenter", (event) => highlightTeamPath(event.target.getAttribute("data-team")))
            .on("mouseleave", () => resetHighlight())
            .text(match.score2.toString());
    }
};

// Draw connecting lines between matches
const drawConnectingLines = (
    svgElement: d3.Selection<SVGElement, unknown, null, undefined>,
    match: Match,
    position: MatchPosition,
    prevMatch1: Match,
    prevMatch2: Match,
    pos1: MatchPosition,
    pos2: MatchPosition,
    roundWidth: number,
    matchHeight: number
) => {
    const boxWidth = roundWidth * MATCH_BOX_WIDTH_RATIO;
    const boxHeight = matchHeight * MATCH_BOX_HEIGHT_RATIO;
    const teamHeight = boxHeight / 2;
    const boxCornerRadius = 5;

    const startX1 = pos1.x + boxWidth - boxCornerRadius;
    const startY1 = pos1.y + teamHeight;
    const startX2 = pos2.x + boxWidth - boxCornerRadius;
    const startY2 = pos2.y + teamHeight;
    const endX = position.x + boxCornerRadius;
    const endY = position.y + teamHeight;
    
    const joinX = startX1 + (endX - startX1) * JOIN_POINT_RATIO;
    const midY = (startY1 + startY2) / 2;

    [
        { startY: startY1, prevMatch: prevMatch1 },
        { startY: startY2, prevMatch: prevMatch2 }
    ].forEach((data, index) => {
        const isTop = index === 0;
        svgElement.append("path")
            .attr("d", `M ${isTop ? startX1 : startX2} ${data.startY} 
                       H ${joinX - CORNER_RADIUS}
                       Q ${joinX} ${data.startY}, ${joinX} ${data.startY + (isTop ? CORNER_RADIUS : -CORNER_RADIUS)}
                       V ${midY + (isTop ? -CORNER_RADIUS : CORNER_RADIUS)}
                       Q ${joinX} ${midY}, ${joinX + CORNER_RADIUS} ${midY}
                       H ${endX}`)
            .attr("stroke", COLORS.border)
            .attr("stroke-width", LINE_THICKNESS)
            .attr("fill", "none")
            .attr("data-match", match.id)
            .attr("data-prev-match", data.prevMatch.id);
    });
};

// Highlight team path
const highlightTeamPath = (team: string) => {
    if (!team) return;
    
    const teamMatches = teamPaths.get(team);
    if (!teamMatches) return;
    
    const connections = findTeamConnections(team);
    
    const opponents = new Set<string>();
    const matchesWithTeam = new Set<string>();
    
    teamMatches.forEach(pathInfo => {
        const match = props.matches.find(m => m.id === pathInfo.matchId);
        if (!match) return;
        
        matchesWithTeam.add(pathInfo.matchId);
        
        if (match.team1 === team) {
            opponents.add(match.team2);
        } else {
            opponents.add(match.team1);
        }
    });

    // Dim all elements
    d3.select(svg.value)
        .selectAll("rect, text, path, image")
        .style("opacity", OPACITY_DIM);
        
    // Dim path lines
    d3.select(svg.value)
        .selectAll("path")
        .style("stroke-width", LINE_THICKNESS_DIM);

    // Highlight the team's matches
    d3.select(svg.value)
        .selectAll(`rect[data-team="${team}"], text[data-team="${team}"], image[data-team="${team}"], g[data-team="${team}"]`)
        .style("opacity", 1);
    
    // Highlight opponents
    opponents.forEach(opponent => {
        const matchIds = Array.from(matchesWithTeam);
        const selector = matchIds.map(id => 
            `g[data-match-id="${id}"] rect[data-team="${opponent}"], 
             g[data-match-id="${id}"] text[data-team="${opponent}"], 
             g[data-match-id="${id}"] image[data-team="${opponent}"], 
             g[data-match-id="${id}"] g[data-team="${opponent}"]`
        ).join(', ');
        
        if (selector) {
            d3.select(svg.value)
                .selectAll(selector)
                .style("opacity", 1);
        }
    });
    
    // Highlight the connection lines
    connections.forEach(conn => {
        d3.select(svg.value)
            .selectAll(`path[data-match="${conn.target}"][data-prev-match="${conn.source}"]`)
            .style("opacity", 1)
            .style("stroke-width", LINE_THICKNESS);
    });
};

// Reset highlight
const resetHighlight = () => {
    d3.select(svg.value)
        .selectAll("rect, text, path, image, g")
        .style("opacity", 1);
        
    d3.select(svg.value)
        .selectAll("path")
        .style("stroke-width", LINE_THICKNESS);
};

// Get round title
const getRoundTitle = (roundIndex: number, maxRound: number): string => {
    // If custom titles are provided, use them
    if (props.roundTitles && props.roundTitles[roundIndex]) {
        return props.roundTitles[roundIndex];
    }
    
    const titleIndex = maxRound - roundIndex;
    if (titleIndex >= 0 && titleIndex < DEFAULT_ROUND_TITLES.length) {
        return DEFAULT_ROUND_TITLES[DEFAULT_ROUND_TITLES.length - 1 - titleIndex];
    }
    
    return `Round ${roundIndex + 1}`;
};

// Draw round titles
const drawRoundTitles = (
    svgElement: d3.Selection<SVGElement, unknown, null, undefined>,
    width: number, 
    height: number, 
    margin: number,
    roundWidth: number,
    maxRound: number
) => {
    // For each round, add a title
    for (let round = 0; round <= maxRound; round++) {
        const x = margin + round * roundWidth + (roundWidth / 2);
        const y = margin / 2;
        
        svgElement.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .attr("font-size", TITLE_FONT_SIZE)
            .attr("font-weight", "bold")
            .attr("fill", "#374151")
            .text(getRoundTitle(round, maxRound));
    }
};

// Main drawing function
const drawTournament = () => {
    if (!svg.value || !container.value) return;

    calculateTeamPaths();

    const width = container.value.clientWidth;
    const height = container.value.clientHeight;
    const margin = Math.min(width, height) * MARGIN_RATIO;

    d3.select(svg.value).selectAll("*").remove();

    const maxRound = Math.max(...props.matches.map(m => m.round));
    const roundWidth = (width - 2 * margin) / (maxRound + 1);
    const matchHeight = (height - 2 * margin - TITLE_MARGIN_TOP) / (Math.pow(2, maxRound));

    const svgElement = d3.select(svg.value)
        .attr("width", width)
        .attr("height", height);
        
    // Draw round titles
    drawRoundTitles(svgElement, width, height, margin, roundWidth, maxRound);

    const matchPositions = calculateMatchPositions(width, height, margin + TITLE_MARGIN_TOP, roundWidth, matchHeight);

    props.matches.forEach(match => {
        const position = matchPositions.get(match.id);
        if (!position) return;

        const matchGroup = svgElement.append("g")
            .attr("transform", `translate(${position.x}, ${position.y})`);

        const boxWidth = roundWidth * MATCH_BOX_WIDTH_RATIO;
        const boxHeight = matchHeight * MATCH_BOX_HEIGHT_RATIO;

        drawMatchBox(matchGroup, match, boxWidth, boxHeight);

        if (match.round > 0) {
            const prevMatch1 = props.matches.find(m => m.round === match.round - 1 && m.match === match.match * 2);
            const prevMatch2 = props.matches.find(m => m.round === match.round - 1 && m.match === match.match * 2 + 1);
            
            if (prevMatch1 && prevMatch2) {
                const pos1 = matchPositions.get(prevMatch1.id);
                const pos2 = matchPositions.get(prevMatch2.id);
                
                if (pos1 && pos2) {
                    drawConnectingLines(svgElement, match, position, prevMatch1, prevMatch2, pos1, pos2, roundWidth, matchHeight);
                }
            }
        }
    });
};

// Watch for changes in matches
watch(() => props.matches, () => {
    drawTournament();
}, { deep: true });

// Lifecycle hooks
onMounted(() => {
    drawTournament();
    
    resizeObserver = new ResizeObserver(() => {
        drawTournament();
    });
    
    if (container.value) {
        resizeObserver.observe(container.value);
    }
});

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});
</script>