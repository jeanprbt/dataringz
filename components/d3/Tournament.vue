<template>
    <div ref="container" class="w-full h-full">
        <svg ref="svg" class="w-full h-full"></svg>
    </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import { ref, watch, onMounted, onUnmounted } from 'vue';

// Types
interface Match {
    id: string;
    round: number;
    match: number;
    participant1: string;
    participant2: string;
    winner?: string;
    score1?: number;
    score2?: number;
    participantType?: string;
    participant1Slug?: string;
    participant2Slug?: string;
    participant1Img?: string;
    participant2Img?: string;
    participant1SlugBis?: string;
    participant2SlugBis?: string;
    isBronzeMedal?: boolean;
    isGoldMedal?: boolean;
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
    isBronzeMedal?: boolean;
    isGoldMedal?: boolean;
}

// Props
const props = defineProps<TournamentProps>();

// Refs
const router = useRouter();
const container = ref<HTMLElement | null>(null);
const svg = ref<SVGElement | null>(null);
let resizeObserver: ResizeObserver;

// Constants
const MATCH_BOX_WIDTH_RATIO = 0.85;
const MATCH_BOX_HEIGHT_RATIO = 0.8;
const MARGIN_RATIO = 0.05;
const CORNER_RADIUS = 10;
const JOIN_POINT_RATIO = 0.6;
const LINE_THICKNESS = 1.5;
const LINE_THICKNESS_DIM = 0.8;
const OPACITY_DIM = 0.3;
const FLAG_WIDTH = 18;
const FLAG_HEIGHT = 12;
const TEXT_PADDING = 30;
const FONT_WEIGHT = {
    winner: "bold",
    loser: "normal"
};
const TITLE_MARGIN_TOP = 30;
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
    light: {
        winner: {
            background: '#dcfce7',
            text: '#059669'
        },
        loser: {
            background: '#f3f4f6',
            text: '#4b5563'
        },
        border: '#d1d5db',
        title: '#374151',
        bronze: {
            background: '#fef3c7',
            text: '#d97706'
        }
    },
    dark: {
        winner: {
            background: '#065f46',
            text: '#d1fae5'
        },
        loser: {
            background: '#1f2937',
            text: '#9ca3af'
        },
        border: '#4b5563',
        title: '#e5e7eb',
        bronze: {
            background: '#92400e',
            text: '#fef3c7'
        }
    }
};

// Reactive state
const isDarkMode = ref(false);

// Function to get current color scheme
const getColors = () => isDarkMode.value ? COLORS.dark : COLORS.light;

// Track team paths
const teamPaths = new Map<string, TeamPathInfo[]>();

// Calculate team paths
const calculateTeamPaths = () => {
    teamPaths.clear();

    props.matches.forEach(match => {
        // Add match to team1's path
        if (!teamPaths.has(match.participant1)) {
            teamPaths.set(match.participant1, []);
        }
        teamPaths.get(match.participant1)?.push({
            matchId: match.id,
            round: match.round,
            matchNumber: match.match,
            isBronzeMedal: match.isBronzeMedal,
            isGoldMedal: match.isGoldMedal
        });

        // Add match to team2's path
        if (!teamPaths.has(match.participant2)) {
            teamPaths.set(match.participant2, []);
        }
        teamPaths.get(match.participant2)?.push({
            matchId: match.id,
            round: match.round,
            matchNumber: match.match,
            isBronzeMedal: match.isBronzeMedal,
            isGoldMedal: match.isGoldMedal
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

        if (!currentMatch) continue;

        // For bronze medal games, only connect if the team lost the previous match
        if (current.isBronzeMedal) {
            if (currentMatch.winner === team) {
                // This team won the bronze medal, no further connections
                continue;
            }
        } else if (currentMatch.winner !== team) {
            // For regular matches, only connect if the team won
            continue;
        }

        for (let j = i + 1; j < sortedMatches.length; j++) {
            const next = sortedMatches[j];
            const nextMatch = props.matches.find(m => m.id === next.matchId);

            if (!nextMatch) continue;

            // Connect to next round or to bronze medal game if team lost semi-final
            if (next.round === current.round + 1 ||
                (next.isBronzeMedal && current.round === next.round - 1 && currentMatch.winner !== team)) {
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

// Calculate match positions with special handling for bronze medal games
const calculateMatchPositions = (height: number, margin: number, roundWidth: number, matchHeight: number): Map<string, MatchPosition> => {
    const positions = new Map<string, MatchPosition>();
    const maxRound = Math.max(...props.matches.map(m => m.round));

    // Separate regular matches from bronze medal matches
    const regularMatches = props.matches.filter(m => !m.isBronzeMedal);
    const bronzeMatches = props.matches.filter(m => m.isBronzeMedal);

    // Calculate positions for regular tournament matches
    const firstRoundMatches = regularMatches.filter(m => m.round === 0);
    const availableHeight = height - 2 * margin - TITLE_MARGIN_TOP;

    // Adjust vertical spacing based on number of rounds
    const isShortTournament = maxRound <= 2;

    if (firstRoundMatches.length > 0) {
        const firstRoundStartY = margin + TITLE_MARGIN_TOP + (availableHeight - (firstRoundMatches.length * matchHeight)) / 2;

        firstRoundMatches.forEach((match, index) => {
            positions.set(match.id, {
                x: margin + match.round * roundWidth,
                y: firstRoundStartY + index * matchHeight
            });
        });
    }

    // Calculate subsequent round positions for regular matches
    for (let round = 1; round <= maxRound; round++) {
        const currentRoundMatches = regularMatches.filter(m => m.round === round);
        currentRoundMatches.forEach(match => {
            // Find previous matches that feed into this match
            const prevMatches = regularMatches.filter(m =>
                m.round === round - 1 &&
                Math.floor(m.match / 2) === match.match
            ).sort((a, b) => a.match - b.match);

            if (prevMatches.length >= 2) {
                const pos1 = positions.get(prevMatches[0].id);
                const pos2 = positions.get(prevMatches[1].id);

                if (pos1 && pos2) {
                    positions.set(match.id, {
                        x: margin + round * roundWidth,
                        y: (pos1.y + pos2.y) / 2
                    });
                }
            } else if (prevMatches.length === 1) {
                // Single previous match (edge case)
                const pos1 = positions.get(prevMatches[0].id);
                if (pos1) {
                    positions.set(match.id, {
                        x: margin + round * roundWidth,
                        y: pos1.y
                    });
                }
            }
        });
    }

    // Position bronze medal matches at the bottom right
    bronzeMatches.forEach(match => {
        // Find the final match position
        const finalMatch = regularMatches.find(m => m.round === maxRound && !m.isBronzeMedal);
        const finalMatchPos = finalMatch ? positions.get(finalMatch.id) : null;

        if (finalMatchPos) {
            // Position bronze medal match at the bottom right
            positions.set(match.id, {
                x: finalMatchPos.x, // Same x as final match
                y: height - margin - matchHeight // At the bottom
            });
        } else {
            // Fallback position if no final match found
            positions.set(match.id, {
                x: margin + maxRound * roundWidth,
                y: height - margin - matchHeight
            });
        }
    });

    return positions;
};

// Add flag image to SVG
const addFlag = (
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    imgPath: string,
    x: number,
    y: number,
    team: string,
) => {
    group.append("image")
        .attr("x", x)
        .attr("y", y - FLAG_HEIGHT / 2)
        .attr("width", FLAG_WIDTH)
        .attr("height", FLAG_HEIGHT)
        .attr("href", imgPath)
        .attr("data-team", team)
        .on("mouseenter", () => highlightTeamPath(team))
        .on("mouseleave", () => resetHighlight());
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

        if (match.participant1 === team) {
            opponents.add(match.participant2);
        } else {
            opponents.add(match.participant1);
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

// Get round title with special handling for bronze medal games
const getRoundTitle = (roundIndex: number, maxRound: number, hasBronzeMedal: boolean = false): string => {
    // If custom titles are provided, use them
    if (props.roundTitles && props.roundTitles[roundIndex]) {
        return props.roundTitles[roundIndex];
    }

    // Special handling for bronze medal games
    if (hasBronzeMedal && roundIndex === maxRound) {
        return "Bronze Medal";
    }

    const titleIndex = maxRound - roundIndex;
    if (titleIndex >= 0 && titleIndex < DEFAULT_ROUND_TITLES.length) {
        return DEFAULT_ROUND_TITLES[DEFAULT_ROUND_TITLES.length - 1 - titleIndex];
    }

    return `Round ${roundIndex + 1}`;
};

// Draw a single match box with special styling for bronze medal games
const drawMatchBox = (matchGroup: d3.Selection<SVGGElement, unknown, null, undefined>, match: Match, boxWidth: number, boxHeight: number) => {
    matchGroup.attr("data-match-id", match.id);

    const fitTextToWidth = (
        textSelection: d3.Selection<SVGTextElement, unknown, null, undefined>,
        maxWidth: number,
        initialFontSize = 16,
        minFontSize = 8
    ) => {
        let fontSize = initialFontSize;
        textSelection.style("font-size", `${fontSize}px`);

        let node = textSelection.node();
        if (!node) return;

        while (node.getBBox().width > maxWidth && fontSize > minFontSize) {
            fontSize -= 1;
            textSelection.style("font-size", `${fontSize}px`);
        }
    };

    const teamHeight = boxHeight / 2;
    const currentColors = getColors();

    // Helper function to get medal emoji
    const getMedalEmoji = (team: string, isLastRound: boolean) => {
        if (!isLastRound) return '';
        if (match.isGoldMedal === true) {
            if (team === match.winner) return ' 🥇';
            if (match.winner) return ' 🥈';
        }
        if (match.isBronzeMedal === true && team === match.winner) return ' 🥉';
        return '';
    };

    // Check if this is the last round
    const isLastRound = (match.isGoldMedal === true || match.isBronzeMedal === true);

    [0, 1].forEach((index) => {
        const isWinner = index === 0 ? match.winner === match.participant1 : match.winner === match.participant2;
        let colors = isWinner ? currentColors.winner : currentColors.loser;

        // Special styling for bronze medal games
        if (match.isBronzeMedal && isWinner) {
            colors = currentColors.bronze;
        }

        matchGroup.append("rect")
            .attr("y", index * teamHeight)
            .attr("width", boxWidth)
            .attr("height", teamHeight)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", colors.background)
            .attr("stroke", currentColors.border)
            .attr("stroke-width", match.isBronzeMedal ? 2 : 1)
            .attr("data-team", index === 0 ? match.participant1 : match.participant2)
            .on("mouseenter", (event) => highlightTeamPath(event.target.getAttribute("data-team")))
            .on("mouseleave", () => resetHighlight());
    });

    const paddingX = 8;
    const paddingY = 5;

    // Team 1 info
    const team1Group = matchGroup.append("g")
        .attr("transform", `translate(10, ${teamHeight / 2})`)
        .attr("data-team", match.participant1);

    // Add flag for team1 if image exists
    const hasTeam1Flag = !!match.participant1Img;
    const team1TextX = hasTeam1Flag ? TEXT_PADDING : 0;

    if (hasTeam1Flag) {
        addFlag(team1Group, match.participant1Img!, 0, 0, match.participant1);
    }

    // Add team name with font-weight based on winner
    const isTeam1Winner = match.winner === match.participant1;
    let team1Colors = isTeam1Winner ? currentColors.winner : currentColors.loser;
    if (match.isBronzeMedal && isTeam1Winner) {
        team1Colors = currentColors.bronze;
    }

    // Determine if teams are athletes or countries
    const isTeamAthlete = match.participantType === 'Person';

    // Create a clickable group for team2 name (first!)
    const team1Text = team1Group.append("text")
        .attr("x", team1TextX)
        .attr("dy", "0.32em")
        .attr("fill", team1Colors.text)
        .attr("font-weight", isTeam1Winner ? FONT_WEIGHT.winner : FONT_WEIGHT.loser)
        .attr("data-team", match.participant2)
        .style("cursor", match.participant1Slug ? "pointer" : "default")
        .text(match.participant1 + getMedalEmoji(match.participant1, isLastRound))
        .on("mouseenter", (event) => {
            team1Text.style("text-decoration", match.participant1Slug ? "underline" : "none");
            highlightTeamPath(event.target.getAttribute("data-team"));
        })
        .on("mouseleave", () => {
            team1Text.style("text-decoration", "none");
            resetHighlight();
        });

    // Only add click handler if slug exists
    if (match.participant1Slug) {
        team1Text.on("click", () => {
            if (isTeamAthlete) {
                router.push(`/athlete/${match.participant1Slug}`);
            } else {
                router.push(`/country/${match.participant1Slug}`);
            }
        });
    }


    fitTextToWidth(team1Text, boxWidth - 80);

    // Get bounding box of the text to size the highlight rect
    let bboxNode = team1Text.node();
    let bbox = bboxNode ? bboxNode.getBBox() : { x: 0, y: 0, width: 100, height: 20 };

    const team1Highlight = team1Group.insert("rect", "text") // Insert before the text
        .attr("x", bbox.x - paddingX)
        .attr("y", bbox.y - paddingY)
        .attr("width", bbox.width + paddingX * 2)
        .attr("height", bbox.height + paddingY * 2)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", team1Colors.background)
        .attr("fill-opacity", 0)
        .attr("data-team", match.participant2);

    if (match.score1 !== undefined) {
        team1Group.append("text")
            .attr("x", boxWidth - 30)
            .attr("dy", "0.32em")
            .attr("fill", team1Colors.text)
            .attr("font-weight", isTeam1Winner ? FONT_WEIGHT.winner : FONT_WEIGHT.loser)
            .attr("text-anchor", "end")
            .attr("data-team", match.participant1)
            .on("mouseenter", (event) => highlightTeamPath(event.target.getAttribute("data-team")))
            .on("mouseleave", () => resetHighlight())
            .text(match.score1.toString());
    }


    // Team 2 info
    const team2Group = matchGroup.append("g")
        .attr("transform", `translate(10, ${teamHeight * 1.5})`)
        .attr("data-team", match.participant2);

    // Add flag for team2 if image exists
    const hasTeam2Flag = !!match.participant2Img;
    const team2TextX = hasTeam2Flag ? TEXT_PADDING : 0;

    if (hasTeam2Flag) {
        addFlag(team2Group, match.participant2Img!, 0, 0, match.participant2);
    }

    // Add team name with font-weight based on winner
    const isTeam2Winner = match.winner === match.participant2;
    let team2Colors = isTeam2Winner ? currentColors.winner : currentColors.loser;
    if (match.isBronzeMedal && isTeam2Winner) {
        team2Colors = currentColors.bronze;
    }

    // Create a clickable group for team2 name
    const team2Text = team2Group.append("text")
        .attr("x", team2TextX)
        .attr("dy", "0.32em")
        .attr("fill", team2Colors.text)
        .attr("font-weight", isTeam2Winner ? FONT_WEIGHT.winner : FONT_WEIGHT.loser)
        .attr("data-team", match.participant2)
        .style("cursor", match.participant2Slug ? "pointer" : "default")
        .text(match.participant2 + getMedalEmoji(match.participant2, isLastRound))
        .on("mouseenter", (event) => {
            team2Text.style("text-decoration", match.participant2Slug ? "underline" : "none");
            highlightTeamPath(event.target.getAttribute("data-team"));
        })
        .on("mouseleave", () => {
            team2Text.style("text-decoration", "none");
            resetHighlight();
        });

    // Only add click handler if slug exists
    if (match.participant2Slug) {
        team2Text.on("click", () => {
            if (isTeamAthlete) {
                router.push(`/athlete/${match.participant2Slug}`);
            } else {
                router.push(`/country/${match.participant2Slug}`);
            }
        });

        fitTextToWidth(team2Text, boxWidth - 80);

        // Get bounding box of the text to size the highlight rect
        bboxNode = team2Text.node();
        bbox = bboxNode ? bboxNode.getBBox() : { x: 0, y: 0, width: 100, height: 20 };

        const team2Highlight = team2Group.insert("rect", "text") // Insert before the text
            .attr("x", bbox.x - paddingX)
            .attr("y", bbox.y - paddingY)
            .attr("width", bbox.width + paddingX * 2)
            .attr("height", bbox.height + paddingY * 2)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", team2Colors.background)
            .attr("fill-opacity", 0)
            .attr("data-team", match.participant2);

        if (match.score2 !== undefined) {
            team2Group.append("text")
                .attr("x", boxWidth - 30)
                .attr("dy", "0.32em")
                .attr("fill", team2Colors.text)
                .attr("font-weight", isTeam2Winner ? FONT_WEIGHT.winner : FONT_WEIGHT.loser)
                .attr("text-anchor", "end")
                .attr("data-team", match.participant2)
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
        // Skip drawing lines for bronze medal matches
        if (match.isBronzeMedal) return;

        const boxWidth = roundWidth * MATCH_BOX_WIDTH_RATIO;
        const boxHeight = matchHeight * MATCH_BOX_HEIGHT_RATIO;
        const teamHeight = boxHeight / 2;
        const boxCornerRadius = 5;
        const currentColors = getColors();

        const startX1 = pos1.x + boxWidth - boxCornerRadius;
        const startY1 = pos1.y + teamHeight;
        const startX2 = pos2.x + boxWidth - boxCornerRadius;
        const startY2 = pos2.y + teamHeight;
        const endX = position.x + boxCornerRadius;

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
                .attr("stroke", currentColors.border)
                .attr("stroke-width", LINE_THICKNESS)
                .attr("fill", "none")
                .attr("data-match", match.id)
                .attr("data-prev-match", data.prevMatch.id);
        });
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
        const currentColors = getColors();
        const hasBronzeMedal = props.matches.some(m => m.isBronzeMedal);

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
                .attr("fill", currentColors.title)
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
        const regularMatches = props.matches.filter(m => !m.isBronzeMedal);
        const matchHeight = (height - 2 * margin - TITLE_MARGIN_TOP) / Math.max(1, Math.pow(2, Math.max(...regularMatches.map(m => m.round))));

        const svgElement = d3.select(svg.value)
            .attr("width", width)
            .attr("height", height);

        // Draw round titles
        drawRoundTitles(svgElement, width, height, margin, roundWidth, maxRound);

        const matchPositions = calculateMatchPositions(height, margin + TITLE_MARGIN_TOP, roundWidth, matchHeight);

        props.matches.forEach(match => {
            const position = matchPositions.get(match.id);
            if (!position) return;

            const matchGroup = svgElement.append("g")
                .attr("transform", `translate(${position.x}, ${position.y})`);

            const boxWidth = roundWidth * MATCH_BOX_WIDTH_RATIO;
            const boxHeight = matchHeight * MATCH_BOX_HEIGHT_RATIO;

            drawMatchBox(matchGroup, match, boxWidth, boxHeight);

            // Draw connecting lines for regular tournament progression
            if (match.round > 0 && !match.isBronzeMedal) {
                const regularMatches = props.matches.filter(m => !m.isBronzeMedal);
                const prevMatches = regularMatches.filter(m =>
                    m.round === match.round - 1 &&
                    Math.floor(m.match / 2) === match.match
                ).sort((a, b) => a.match - b.match);

                if (prevMatches.length >= 2) {
                    const pos1 = matchPositions.get(prevMatches[0].id);
                    const pos2 = matchPositions.get(prevMatches[1].id);

                    if (pos1 && pos2) {
                        drawConnectingLines(svgElement, match, position, prevMatches[0], prevMatches[1], pos1, pos2, roundWidth, matchHeight);
                    }
                }
            }
        });
    };

    // Watch for changes in matches
    watch(() => props.matches, () => {
        drawTournament();
    }, { deep: true });

    // Watch for dark mode changes
    const checkDarkMode = () => {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        isDarkMode.value = darkModeQuery.matches;

        // Listen for changes in user preference
        darkModeQuery.addEventListener('change', (e) => {
            isDarkMode.value = e.matches;
            drawTournament();
        });
    };

    // Lifecycle hooks
    onMounted(() => {
        checkDarkMode();
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
}
</script>