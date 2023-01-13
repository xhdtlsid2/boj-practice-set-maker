export const errorMessages = {
    ERR_USER_ALREADY_EXISTS       : "이미 추가된 유저입니다.",
    ERR_USER_DOESNT_EXIST         : "solved.ac에 등록되어 있지 않은 유저입니다.",
    ERR_TAG_DOESNT_EXIST        : "태그 검색 결과가 없습니다.",
    ERR_INVALID_PROBLEMSET_SIZE : "셋에는 1문제 이상 포함되어야 하고, 최대 26문제까지 포함될 수 있습니다.",
    ERR_BAD_REQUEST             : "요청 횟수가 너무 많거나 요청 쿼리 길이가 너무 깁니다.",
    ERR_FAILED_TO_LOAD          : "정보를 불러오지 못했습니다.",
    ERR_INSUFFICIENT_PROBLEM    : (tierName, availableCount) =>
        `조건을 만족하는 ${tierName} 문제의 수(${availableCount})가 설정한 문제 수보다 적습니다.`
};