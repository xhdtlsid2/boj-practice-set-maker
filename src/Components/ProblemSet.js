import { useState } from "react";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { tierName, solvedacLevelToTierIndex } from "../utils/TierName";
import prevPage from "../images/chevron-left.svg";
import nextPage from "../images/chevron-right.svg";

const PROBLEMS_PER_PAGE = 13;

export default function ProblemSet({
    problemSet,
    updateProblemSet
}){
    const [page, setPage] = useState(0);

    function sortProblemSetByTier(){
        const reordered = problemSet.slice();
        reordered.sort((a, b) => a.level - b.level);
        updateProblemSet(reordered);
    }
    function sortProblemSetRandom(){
        const reordered = problemSet.slice();
        for(let i = problemSet.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));   // random index between 0 and i
            [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
        }
        updateProblemSet(reordered);
    }

    return (
        <>
            <Row>
                <Button
                    variant="light"
                    id="page-move-button-prev"
                    disabled={!page}
                    onClick={() => setPage(page - 1)}
                >
                    <img src={prevPage} alt="이전 페이지" />
                </Button>
                <ListGroup as="ol" id="problem-set-list" horizontal>
                    {problemSet.reduce((display, { problemId, level }, index) => {
                        if(
                            index < PROBLEMS_PER_PAGE * page ||
                            index >= PROBLEMS_PER_PAGE * (page + 1)
                        ) return display;
                        return [...display,
                            <ListGroup.Item as="li" key={problemId}>
                                <div>{String.fromCharCode(65 + index)}</div>
                                <img
                                    src={`https://static.solved.ac/tier_small/${level}.svg`}
                                    alt={tierName(solvedacLevelToTierIndex(level))}
                                />
                                <a
                                    href={`https://www.acmicpc.net/problem/${problemId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {problemId}
                                </a>
                            </ListGroup.Item>
                        ];
                    }, [])}
                </ListGroup>
                <Button
                    variant="light"
                    id="page-move-button-next"
                    disabled={page === calculateLastPage(problemSet.length)}
                    onClick={() => setPage(page + 1)}
                >
                    <img src={nextPage} alt="다음 페이지" />
                </Button>
            </Row>
            <Row>
                <Button
                    id="problem-set-sort-button-tier"
                    onClick={() => sortProblemSetByTier()}
                >
                    난이도순 정렬
                </Button>
                <Button
                    id="problem-set-sort-button-random"
                    onClick={() => sortProblemSetRandom()}
                >
                    무작위로 섞기
                </Button>
            </Row>
            <div id="problem-set-comma-separated-list">
                {problemSet.map(({ problemId }) => problemId).join(",")}
            </div>
        </>
    );
}

function calculateLastPage(problemCount){
    return Math.ceil(problemCount / PROBLEMS_PER_PAGE) - 1;
}