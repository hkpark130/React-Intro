const validationErrors = new Map([
  ['INVALID_POST_TITLE', {
    status: 400,
    message: '제목을 입력하고 255자 이내로 작성해 주세요. 일부 이모지는 2자 이상으로 계산됩니다.',
  }],
  ['INVALID_POST_CONTENT', {
    status: 400,
    message: '본문 내용을 입력한 뒤 다시 저장해 주세요.',
  }],
  ['POST_CONTENT_TOO_LARGE', {
    status: 413,
    message: '본문이 UTF-8 기준 1MiB 한도를 넘었습니다. 긴 코드·표를 줄이거나 글을 나누어 다시 저장해 주세요. 현재 작성 내용은 유지했습니다.',
  }],
  ['INVALID_POST_CATEGORY', {
    status: 400,
    message: '선택한 카테고리를 사용할 수 없습니다. 목록에서 다른 카테고리를 선택한 뒤 다시 저장해 주세요.',
  }],
]);

export function postSaveErrorMessage(error, fallback) {
  const { status, data } = error?.response || {};
  const knownError = validationErrors.get(data?.code);
  return knownError && knownError.status === status ? knownError.message : fallback;
}
