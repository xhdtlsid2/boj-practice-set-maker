import Col from "react-bootstrap/Col";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from "react-bootstrap/Button";
import { tierName } from "../utils/TierName";
import expand from "../images/chevron-down.svg";
import collapse from "../images/chevron-up.svg";
import help from "../images/question-circle.svg";

function SingleProblemOption({
    tierIndex,
    count,
    disabled,
    onProblemCountChange
}){
    return (
        <div className="single-problem-option">
            <span className={`tier-${tierIndex}`}>
                {tierName(tierIndex)}
            </span>
            <div>
                <input
                    value={disabled ? "" : count}
                    disabled={disabled}
                    onChange={e => onProblemCountChange(tierIndex, e.target.value)}
                />
                <span>문제</span>
            </div>
        </div>
    );
}

export default function ProblemOption({
    problemOption,
    setProblemOption
}){
    function handleProblemCountChange(tierIndex, newCount){
        if(!/^[0-9]*$/.test(newCount)) return;
        const optionIndex = Math.floor(tierIndex / 6);
        const subIndex = tierIndex % 6;
        setProblemOption([
            ...problemOption.slice(0, optionIndex),
            {
                ...problemOption[optionIndex],
                count: [
                    ...problemOption[optionIndex].count.slice(0, subIndex),
                    newCount,
                    ...problemOption[optionIndex].count.slice(subIndex + 1, 6)
                ]
            },
            ...problemOption.slice(optionIndex + 1, 6)
        ]);
    }
    function handleProblemDetailChange(optionIndex){
        setProblemOption([
            ...problemOption.slice(0, optionIndex),
            {
                ...problemOption[optionIndex],
                isDetail: !problemOption[optionIndex].isDetail
            },
            ...problemOption.slice(optionIndex + 1, 6)
        ]);
        /*
        setProblemOption(prevOption => {
            const newOption = structuredClone(prevOption);
            newOption[optionIndex].isDetail = !prevOption[optionIndex].isDetail;
            return newOption;
        });
        */
    }

    return (
        <Col>
            <h2>문제 수 설정하기</h2>
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>각 난이도별로 셋에 포함시킬 문제 수를 설정할 수 있습니다.</Tooltip>}
            >
                <img src={help} alt="도움말" />
            </OverlayTrigger>
            <div id="problem-option-content">
                {problemOption.map(({ isDetail, count }, optionIndex) =>
                    <div key={optionIndex} className="group-problem-option">
                        <div className="detail-toggle-column">
                            <Button variant="light" onClick={() => handleProblemDetailChange(optionIndex)}>
                                <img
                                    src={isDetail ? collapse : expand}
                                    alt={isDetail ? "간략히" : "자세히"}
                                />
                            </Button>
                        </div>
                        <div>
                            {count.map((value, subIndex) => (!subIndex || isDetail) &&
                                <SingleProblemOption
                                    key={subIndex}
                                    tierIndex={optionIndex * 6 + subIndex}
                                    count={value}
                                    disabled={!subIndex && isDetail}
                                    onProblemCountChange={handleProblemCountChange}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Col>
    );
}