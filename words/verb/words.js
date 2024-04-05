let testMode = false;
const NAME_KEY = {
  JI_SYO: 'jisyo',
  CHINESE: 'chinese',
};
const visibility = {
  JI_SYO: true,
  CHINESE: true,
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

const checkAnswer = async (inputId, jisyo) => {
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
  const convertedJisyo = await kuroshiro?.convert(jisyo, { mode: "normal", to: "hiragana" }) ?? '';
  if (answer === jisyo || (convertedJisyo !== '' && answer === convertedJisyo)) {
    result.textContent = ' 正确 (>_<)!';
    result.className = 'check-result correct';
  } else {
    result.textContent = ` 错误，答案是${jisyo}(${convertedJisyo})`;
    result.className = 'check-result incorrect';
  }
  const cell = input.parentNode;
  cell.appendChild(result);
};

const changeHeimuStatus = (key) => {
  const currentStatus = visibility[key];
  const container = document.querySelector('.japanese-words');
  const words = container.querySelectorAll(`span.${key}-content`);
  visibility[key] = !currentStatus;
  if (true === currentStatus) {
    // 隐藏
    words.forEach(word => {
      word?.classList?.remove('heimu');
    });
  } else {
    words.forEach(word => {
      word?.classList?.add('heimu');
    });
  }
};

const fetchAndRenderTable = (name) => {
  const jsonName = `./words_${name}.json`;
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

      const chineseHeader = document.createElement('th');
      chineseHeader.textContent = '中文';
      headerRow.appendChild(chineseHeader);

      const jisyoHeader = document.createElement('th');
      jisyoHeader.textContent = '字典型';
      headerRow.appendChild(jisyoHeader);

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

        const chineseCell = document.createElement('td');
        const innerChineseCell = document.createElement('span');
        innerChineseCell.textContent = item.chinese;
        innerChineseCell.className = 'chinese-content';
        chineseCell.appendChild(innerChineseCell);
        row.appendChild(chineseCell);

        const jisyoCell = document.createElement('td');
        const innerJisyoCell = document.createElement('span');
        innerJisyoCell.textContent = item.jisyo;
        innerJisyoCell.className = 'jisyo-content';
        jisyoCell.appendChild(innerJisyoCell);
        row.appendChild(jisyoCell);

        // 创建答案检查框
        const inputCell = document.createElement('td');
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
          checkAnswer(inputId, item.jisyo);
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
