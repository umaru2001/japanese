let testMode = false;
let currentTestMode;
const NAME_KEY = {
  CHINESE: 'chinese',
  JISYO: 'jisyo',
  MASU: 'masu',
  TE: 'te',
  NAI: 'nai',
  TA: 'ta',
  MEIREI: 'meirei',
  ISHI: 'ishi',
  BA: 'ba',
  KANOU: 'kanou',
  UKEMI: 'ukemi',
  SHIEKI: 'shieki',
};
const CHINESE_NAME = {
  jisyo: '字典型',
  chinese: '中文',
  masu: 'ます型',
  te: 'て型',
  nai: 'ない型',
  ta: 'た型',
  meirei: '命令型',
  ishi: '意志型',
  ba: 'ば型',
  kanou: '可能型',
  ukemi: '被动型',
  shieki: '使役型',
};
const heimuStatus = {
  jisyo: false,
  chinese: false,
  masu: false,
  te: false,
  nai: false,
  ta: false,
  meirei: false,
  ishi: false,
  ba: false,
  kanou: false,
  ukemi: false,
  shieki: false,
};
const visibility = {
  jisyo: true,
  chinese: true,
  masu: true,
  te: false,
  nai: false,
  ta: false,
  meirei: false,
  ishi: false,
  ba: false,
  kanou: false,
  ukemi: false,
  shieki: false,
};

const hideALine = (event, name) => {
  const nameKey = name;
  const lineVisibility = visibility[name];
  if (lineVisibility === undefined) {
    return;
  }
  visibility[name] = !lineVisibility;
  const container = document.querySelector('.japanese-words');
  const words = container.querySelectorAll(`.${nameKey}-content-cell`);
  const header = container.querySelector(`.${nameKey}-header`);
  header.style.display = lineVisibility ? 'none' : 'table-cell';
  words.forEach(word => {
    word.style.display = lineVisibility ? 'none' : 'table-cell';
  });
  if (event.target) {
    event.target.textContent = lineVisibility ? `显示${CHINESE_NAME[name]}` : `隐藏${CHINESE_NAME[name]}`;
  }
};

// 初始化 kuroshiro
const kuroshiro = new Kuroshiro();
// 初始化 kuroshiro-analyzer-kuromoji
kuroshiro?.init(new KuromojiAnalyzer({
  dictPath: "dict/"
}));

const process = (name) => {
  fetchAndRenderTable(name);
};

const toggleTestMode = () => {
  testMode = !testMode;
  const table = document.querySelector('table');
  table.style.visibility = testMode ? 'visible' : 'hidden';
};

const checkAnswer = async (inputId, item) => {
  if (currentTestMode === undefined) {
    alert('请先选择测试模式！');
    return;
  }
  const correctWord = item[currentTestMode];
  if (correctWord === '' || !correctWord) {
    alert('数据非法');
    return;
  }
  const input = document.getElementById(inputId);
  const result = input.parentNode?.querySelector('.check-result');
  if (!result) {
    return;
  }
  const answer = input.value.trim();
  if (!answer || answer === '') {
    result.textContent = ' 请输入答案呀 O.o';
    result.className = 'check-result incorrect';
    return;
  }
  const convertedJisyo = await kuroshiro?.convert(correctWord, { mode: 'normal', to: 'hiragana' }) ?? '';
  if (answer === correctWord || (convertedJisyo !== '' && answer === convertedJisyo)) {
    result.textContent = ' 正确 (>_<)!';
    result.className = 'check-result correct';
  } else {
    result.textContent = ` 错误，答案是${correctWord}(${convertedJisyo})`;
    result.className = 'check-result incorrect';
  }
  const cell = input.parentNode;
  cell.appendChild(result);
};

// 测试模式变更代码
const changeHeimuStatus = (key) => {
  const currentStatus = heimuStatus[key];
  if (currentStatus === undefined) {
    return;
  }
  const container = document.querySelector('.japanese-words');
  const words = container.querySelectorAll(`span.${key}-content`);
  const testStatusElement = document.querySelector('.test-mode');
  heimuStatus[key] = !currentStatus;
  if (true === currentStatus) {
    testStatusElement.textContent = '当前测试模式：无';
    currentTestMode = undefined;
    words.forEach(word => {
      word?.classList?.remove('heimu');
    });
  } else {
    testStatusElement.textContent = `当前测试模式：${CHINESE_NAME[key]}`;
    currentTestMode = key;
    words.forEach(word => {
      word?.classList?.add('heimu');
    });
  }
};

const fetchAndRenderTable = (name) => {
  const jsonName = `https://pengdonglai.com/japanese/words/verb/words_${name}.json`;
  fetch(jsonName)
    .then(response => response.json())
    .then(data => {
      const body = document.querySelector('.japanese-words');

      const table = document.createElement('table');
      body.appendChild(table);

      const thead = document.createElement('thead');
      table.appendChild(thead);

      const headerRow = document.createElement('tr');
      thead.appendChild(headerRow);

      const idHeader = document.createElement('th');
      idHeader.textContent = 'ID';
      headerRow.appendChild(idHeader);

      for (const key in NAME_KEY) {
        if (Object.hasOwnProperty.call(NAME_KEY, key)) {
          const nameKey = NAME_KEY[key];
          const header = document.createElement('th');
          header.textContent = CHINESE_NAME[nameKey];
          header.style.display = visibility[nameKey] ? 'table-cell' : 'none';
          header.className = `${nameKey}-header`;
          headerRow.appendChild(header);
        }
      }

      const testHeader = document.createElement('th');
      testHeader.textContent = '测试栏';
      headerRow.appendChild(testHeader);

      const tbody = document.createElement('tbody');
      table.appendChild(tbody);

      data.forEach(item => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = item.id;
        row.appendChild(idCell);

        for (const key in NAME_KEY) {
          if (Object.hasOwnProperty.call(NAME_KEY, key)) {
            const nameKey = NAME_KEY[key];
            const cell = document.createElement('td');
            cell.className = `${nameKey}-content-cell`;
            cell.style.display = visibility[nameKey] ? 'table-cell' : 'none';
            const innerCell = document.createElement('span');
            innerCell.textContent = item[nameKey];
            innerCell.className = `${nameKey}-content`;
            cell.appendChild(innerCell);
            row.appendChild(cell);
          }
        }

        // 创建答案检查框
        const inputCell = document.createElement('td');
        inputCell.style.position = 'relative';
        const input = document.createElement('input');
        const checkButton = document.createElement('button');
        const result = document.createElement('span');
        result.className = "check-result";
        const inputId = `input-${item.id}`;
        input.id = inputId;
        inputCell.appendChild(input);
        checkButton.className = 'btn-small waves-effect waves-light';
        checkButton.textContent = '检查';
        checkButton.addEventListener('click', () => {
          checkAnswer(inputId, item);
        });
        inputCell.appendChild(checkButton);
        inputCell.appendChild(result);
        row.appendChild(inputCell);

        tbody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('读取 JSON 文件时发生错误:', error);
    });
};