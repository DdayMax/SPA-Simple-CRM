(() => {

  // Массив клиентов
  let clientsList = [];
  let sortedClientsList = [];
  const SERVER_URL = 'http://localhost:3000';

  // Поиск клиента
  const searchInp = document.getElementById('clients-search');

  // Откладывание вызова функции
  function debounce(func, ms) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), ms);
    };
  }

  // Функция поиска клиента в массиве через инпут
  async function clientsSearch() {
    const searchValue = searchInp.value.toLowerCase().trim(),
      searchResults = document.getElementById('search-results');

    if (searchValue.length === 0) {
      searchResults.classList.remove('show')
    } else {

      const splitValue = searchValue.split(' ');

      async function getClients(arr) {
        const response = await fetch(`${SERVER_URL}/api/clients`);
        const result = await response.json();
        result.forEach(client => {
          arr.push(client)

        })
      }
      let resultArr = [];

      await getClients(resultArr)

      splitValue.forEach((valueItem) => {
        resultArr = resultArr.filter(e => {
          const result = (e.name.toLowerCase().includes(valueItem) || e.surname.toLowerCase().includes(valueItem)) || (e.lastName.toLowerCase().includes(valueItem) || e.id.includes(valueItem));
          return result
        })
        searchResults.textContent = ''
        resultArr.forEach(client => {
          const li = document.createElement('li'),
            a = document.createElement('a');
          a.classList.add('search-link')

          a.textContent = `${client.surname} ${client.name} ${client.lastName}`
          li.append(a)
          a.href = `#${client.id}`
          searchResults.classList.add('show')
          searchResults.append(li)

          window.addEventListener("click", (event) => {
            const target = event.target;

            // Проверяем, был ли клик выполнен внутри результата
            if (target !== searchResults && !searchResults.contains(target)) {
              // Клик вне выдачи результата, закрываем выпадающий список
              searchResults.classList.remove('show')
            }
          });
          a.addEventListener('click', () => {
            document.querySelectorAll('.table__row').forEach(e => {
              e.classList.remove('bg')
            })
            const clientRow = document.getElementById(client.id)
            clientRow.classList.add('bg');
            searchResults.classList.remove('show')
            searchInp.value = ''
            setTimeout(() => {
              clientRow.classList.remove('bg');
            }, 6000);
          })

        })
      })
    }
  }

  const debouncedClientsSearch = debounce(clientsSearch, 300)
  searchInp.addEventListener('input', () => {

    debouncedClientsSearch();
  })

  // Функция сортировки таблицы
  function tableSort(prop, clicked = false,) {

    sortedClientsList = [...clientsList];
    // Функция сортировки массива клиентов
    const sortClients = (arr, prop, dir = false) => arr.sort((a, b) => (!dir ? a[prop] < b[prop] : a[prop] > b[prop]) ? -1 : 1);

    if (!clicked) {
      sortClients(sortedClientsList, prop)
    } else {
      sortClients(sortedClientsList, prop, clicked)
    }

  }
  const arrOfSortBtn = document.querySelectorAll('.table__btn-sort');
  let currentTarget = document.querySelector('.table__btn-sort_id');
  arrOfSortBtn.forEach(e => {
    e.addEventListener('click', () => {

      if (currentTarget === e) {
        e.classList.add('table__btn-sort_active-double-click');
        currentTarget = null;
      } else {
        currentTarget = e;
        e.classList.remove('table__btn-sort_active-double-click');
        arrOfSortBtn.forEach(e => {
          e.classList.remove('table__btn-sort_active-double-click')
        })
      }

      arrOfSortBtn.forEach(e => {
        e.classList.remove('table__btn-sort_active')
      })

      e.classList.add('table__btn-sort_active')

      if (e.classList.contains('table__btn-sort_id')) {
        if (e.classList.contains('table__btn-sort_active-double-click')) {
          tableSort('id', true)
        } else {
          tableSort('id')
        }

      } else if (e.classList.contains('table__btn-sort_fio')) {
        if (e.classList.contains('table__btn-sort_active-double-click')) {
          tableSort('fio', true)
        } else {
          tableSort('fio')
        }

      } else if (e.classList.contains('table__btn-sort_create-date')) {
        if (e.classList.contains('table__btn-sort_active-double-click')) {
          tableSort('createdAt', true)
        } else {
          tableSort('createdAt')
        }

      } else if (e.classList.contains('table__btn-sort_change-date')) {
        if (e.classList.contains('table__btn-sort_active-double-click')) {
          tableSort('updatedAt', true)
        } else {
          tableSort('updatedAt')
        }
      }
      renderList(sortedClientsList)
    })
  })

  const tableBody = document.querySelector('.table__body');
  const body = document.querySelector('body')

  // Форматируем дату
  const formatDate = date => {
    let tmpDate = null,
      tmpHours = null;
    const fixDate = ((tmpDate = date.getDate()) < 10 ? '0' + tmpDate : tmpDate)

      + '.' + ((tmpDate = date.getMonth() + 1) < 10 ? '0' + tmpDate : tmpDate)

      + '.' + (tmpDate = date.getFullYear());

    const fixHours = ((tmpHours = date.getHours()) < 10 ? '0' + tmpHours : tmpHours)

      + ':' + ((tmpHours = date.getMinutes() + 1) < 10 ? '0' + tmpHours : tmpHours);
    return {
      fixDate,
      fixHours
    }
  };

   // Создаем параграф для вывода текста ошибки
   function createErrorElement(node, arr) {
    if (document.querySelector('.invalid-container')) {
      document.querySelector('.invalid-container').remove()
    }
    const div = document.createElement('div')
    arr.forEach(e => {
      const p = document.createElement('p');
      p.classList.add('invalid-text')
      div.append(p)
      p.textContent = e
    })
    div.classList.add('invalid-container')
    node.before(div)
  }

  // массив для складирования ошибок
  let errorsMessages = [];

  //Создание форм по клику, слушатели событий на кнопках change, delete и создания клиента, общий попап элемент для всех кнопок
  function createPopup(btn, client = false) {
    const formBackground = document.createElement('div'),
      formWrapper = document.createElement('div'),
      h3 = document.createElement('h3'),
      acceptBtn = document.createElement('button'),
      closeBtn = document.createElement('button'),
      cancellBtn = document.createElement('button'),
      text = document.createElement('p');
    formBackground.innerHTML = '';

    formWrapper.classList.add('form-wrapper')
    formBackground.classList.add('form-bg');
    closeBtn.classList.add('btn-reset', 'close-btn',);
    h3.classList.add('h3', 'form-h3');
    text.classList.add('form-text')
    acceptBtn.classList.add('btn-reset', 'accept-btn', 'btn', 'btn-filled');
    cancellBtn.classList.add('btn-reset', 'cancell-btn');
    cancellBtn.textContent = 'Отмена';
    const crossSvg = `<svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2332 7.73333L21.2665 6.76666L14.4998 13.5334L7.73318 6.7667L6.76652 7.73336L13.5332 14.5L6.76654 21.2667L7.73321 22.2333L14.4998 15.4667L21.2665 22.2334L22.2332 21.2667L15.4665 14.5L22.2332 7.73333Z" fill="#B0B0B0"/>
    </svg>`
    closeBtn.innerHTML = crossSvg

    formWrapper.append(closeBtn, h3, text);

    formBackground.append(formWrapper);
    setTimeout(() => {
      formWrapper.classList.add('form-wrapper-show')
    }, 100)



    // Функция изменения формы под кнопку изменить и добавить клиента
    function createChangeAndAddForm() {
      // Определяем классы
      const inpClass = 'change-input',
        wrapClass = 'change-input-wrapper',
        labelClass = 'change-label',
        labelReqClass = 'change-label-requared';

      // Создаем элементы
      const form = document.createElement('form'),
        inpSurname = document.createElement('input'),
        inpName = document.createElement('input'),
        inpLastName = document.createElement('input'),
        labelName = document.createElement('label'),
        labelSurname = document.createElement('label'),
        labelLastName = document.createElement('label'),
        nameWrapper = document.createElement('div'),
        surnameWrapper = document.createElement('div'),
        lastNameWrapper = document.createElement('div'),
        submitBtn = document.createElement('button'),
        deleteBtn = document.createElement('button'),
        selectDivWrapper = document.createElement('div'),
        selectDivsWrapper = document.createElement('div'),
        addBtn = document.createElement('button');

      addBtn.setAttribute('type', 'button')
      selectDivWrapper.classList.add('select-bg');
      selectDivsWrapper.classList.add('select-wrappers-wrapper')
      addBtn.classList.add('btn-reset', 'add-contact')

      selectDivWrapper.append(selectDivsWrapper, addBtn)

      const plusSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_224_6671)">
<path d="M7.99998 4.66668C7.63331 4.66668 7.33331 4.96668 7.33331 5.33334V7.33334H5.33331C4.96665 7.33334 4.66665 7.63334 4.66665 8.00001C4.66665 8.36668 4.96665 8.66668 5.33331 8.66668H7.33331V10.6667C7.33331 11.0333 7.63331 11.3333 7.99998 11.3333C8.36665 11.3333 8.66665 11.0333 8.66665 10.6667V8.66668H10.6666C11.0333 8.66668 11.3333 8.36668 11.3333 8.00001C11.3333 7.63334 11.0333 7.33334 10.6666 7.33334H8.66665V5.33334C8.66665 4.96668 8.36665 4.66668 7.99998 4.66668ZM7.99998 1.33334C4.31998 1.33334 1.33331 4.32001 1.33331 8.00001C1.33331 11.68 4.31998 14.6667 7.99998 14.6667C11.68 14.6667 14.6666 11.68 14.6666 8.00001C14.6666 4.32001 11.68 1.33334 7.99998 1.33334ZM7.99998 13.3333C5.05998 13.3333 2.66665 10.94 2.66665 8.00001C2.66665 5.06001 5.05998 2.66668 7.99998 2.66668C10.94 2.66668 13.3333 5.06001 13.3333 8.00001C13.3333 10.94 10.94 13.3333 7.99998 13.3333Z"/>
</g></svg>`;
      addBtn.innerHTML = `Добавить контакт ${plusSvg}`

      deleteBtn.addEventListener('click', () => {
        formBackground.remove();
        body.classList.remove('stop-scroll')
        createPopup('delete', client)
      })



      // Функция добавления инпута и селекта
      function addSelectandInput(contact) {
        const selectDiv = document.createElement('div'),
          crossSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_121_2516)">
        <path d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z"/>
        </g></svg>`,
          select = document.createElement('select'),
          optionTel = document.createElement('option'),
          optionSecondTel = document.createElement('option'),
          optionVk = document.createElement('option'),
          optionFb = document.createElement('option'),
          optionEmail = document.createElement('option'),
          optionOther = document.createElement('option'),
          selectInput = document.createElement('input'),
          deleteContact = document.createElement('button');

        optionTel.setAttribute('value', 'Телефон');
        optionTel.textContent = 'Телефон';
        optionSecondTel.setAttribute('value', 'Доп. Телефон');
        optionSecondTel.textContent = 'Доп. Телефон';
        optionVk.setAttribute('value', 'VK');
        optionVk.textContent = 'VK';
        optionFb.setAttribute('value', 'Facebook');
        optionFb.textContent = 'Facebook';
        optionEmail.setAttribute('value', 'Email');
        optionEmail.textContent = 'Email';
        optionOther.setAttribute('value', 'Другое');
        optionOther.textContent = 'Другое';
        deleteContact.innerHTML = crossSvg;
        deleteContact.classList.add('client-delete-btn', 'btn-reset');
        deleteContact.setAttribute('type', 'button');
        selectDiv.classList.add('select-wrapper')
        selectInput.classList.add('select-input')
        selectInput.placeholder = 'Введите данные контакта'

        select.append(optionTel, optionSecondTel, optionVk, optionFb, optionEmail, optionOther);
        selectDiv.append(select, selectInput, deleteContact);
        selectDivsWrapper.append(selectDiv);

        // Определяем тип контакта клиента
        if (contact) {

          if (contact.type === 'Телефон') {
            selectInput.value = contact.value;
            optionTel.setAttribute('selected', 'selected');
          } else if (contact.type === 'Доп. Телефон') {
            selectInput.value = contact.value;
            optionSecondTel.setAttribute('selected', 'selected');
          } else if (contact.type === 'VK') {
            selectInput.value = contact.value;
            optionVk.setAttribute('selected', 'selected');
          } else if (contact.type === 'Facebook') {
            selectInput.value = contact.value;
            optionFb.setAttribute('selected', 'selected');
          } else if (contact.type === 'Email') {
            selectInput.value = contact.value;
            optionEmail.setAttribute('selected', 'selected');
          } else {
            selectInput.value = contact.value;
            optionOther.setAttribute('selected', 'selected');
          }
        }
        const choices = new Choices(select, {
          searchEnabled: false,
          position: 'bottom',
          itemSelectText: '',
        });
        tippy(deleteContact, {
          content: 'Удалить контакт',
        });

        deleteContact.addEventListener('click', (e) => {
          e.stopPropagation()
          selectDiv.remove()
          selectLengthCheck()
        })
      }

      // второй выбор всех селектов, для применения параметров отображения
      function selectLengthCheck() {
        const arrofSelects = document.querySelectorAll('.select-wrapper');

        if (arrofSelects.length === 10) {
          addBtn.remove()
        } else {
          selectDivWrapper.append(addBtn);
        };
      }

      // Слушатель на кнопку Добавить контакт
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        addSelectandInput(false)
        selectLengthCheck()
      })
      h3.classList.add('form-h3-create-change')
      // Проверяем была ли вызвана функция, через кнопку "Изменить"
      if (btn === 'change') {

        h3.textContent = 'Изменить данные'

        window.location.hash = `ID ${client.id}`

        text.textContent = `ID: ${client.id}`
        if (client.contacts.length > 0) {

          client.contacts.forEach(contact => {
            addSelectandInput(contact)
            // без задержки количество инпутов = 0
            setTimeout(() => {
              selectLengthCheck()
            }, 100);
          })
        }

        inpSurname.value = client.surname;
        inpName.value = client.name;
        inpLastName.value = client.lastName;
      } else {
        h3.textContent = 'Новый клиент'
      }
      submitBtn.innerHTML = 'Сохранить';

      inpSurname.placeholder = 'Фамилия';
      inpSurname.setAttribute('id', 'inpSurname');
      inpName.placeholder = 'Имя'
      inpName.setAttribute('id', 'inpName')
      inpName.setAttribute('type', 'text')
      inpLastName.placeholder = 'Отчество'
      inpLastName.setAttribute('id', 'inpLastname')
      labelName.setAttribute('for', 'inpName')
      labelName.textContent = 'Имя';
      labelSurname.setAttribute('for', 'inpSurname')
      labelSurname.textContent = 'Фамилия';
      labelLastName.setAttribute('for', 'inpLastname')
      labelLastName.textContent = 'Отчество';
      form.setAttribute('id', 'change-form');
      submitBtn.setAttribute('type', 'submit');

      inpName.classList.add(inpClass);
      inpSurname.classList.add(inpClass);
      inpLastName.classList.add(inpClass);
      nameWrapper.classList.add(wrapClass);
      surnameWrapper.classList.add(wrapClass);
      lastNameWrapper.classList.add(wrapClass);
      labelName.classList.add(labelClass, labelReqClass);
      labelSurname.classList.add(labelClass, labelReqClass);
      labelLastName.classList.add(labelClass);
      text.classList.add('form-text-id')
      submitBtn.classList.add('btn-reset', 'accept-btn', 'btn', 'btn-filled');

      nameWrapper.append(labelName, inpName);
      surnameWrapper.append(labelSurname, inpSurname);
      lastNameWrapper.append(labelLastName, inpLastName);

      form.append(surnameWrapper, nameWrapper, lastNameWrapper, selectDivWrapper, submitBtn);
      formWrapper.append(form)
      if (btn === 'change') {
        formWrapper.append(deleteBtn)
      } else {
        formWrapper.append(cancellBtn)
      }

      body.append(formBackground);
      body.classList.add('stop-scroll');

      deleteBtn.classList.add('btn-reset', 'cancell-btn');
      deleteBtn.textContent = 'Удалить';



      // Слушатель на отправку формы
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorsMessages = []

        const arrOfSelect = document.querySelectorAll('.select-wrapper'),
          clientContacts = [];
        arrOfSelect.forEach((e) => {
          const selectValue = e.querySelector('.choices__input').value,
            inputValue = e.querySelector('.select-input').value;
          clientContacts.push({ type: selectValue, value: inputValue })
        })

        const inpNameValue = inpName.value.trim(),
          inpSurnameValue = inpSurname.value.trim(),
          inpLastNameValue = inpLastName.value.trim();

        // Нормализуем ФИО
        const nameFirstLetter = inpNameValue.substring(0, 1).toUpperCase(),
          nameOtherLetters = inpNameValue.substring(1).toLowerCase(),
          normalizedName = nameFirstLetter + nameOtherLetters;

        const surnameFirtstLetter = inpSurnameValue.substring(0, 1).toUpperCase(),
          surnameOtherLetters = inpSurnameValue.substring(1).toLowerCase(),
          normalizedSurname = surnameFirtstLetter + surnameOtherLetters;

        const lastNameFirstLetter = inpLastNameValue.substring(0, 1).toUpperCase(),
          lastNameOtherLetters = inpLastNameValue.substring(1).toLowerCase(),
          normalizedLastName = lastNameFirstLetter + lastNameOtherLetters;

        // Создаем объект клиента
        const clientObj = {
          name: normalizedName,
          lastName: normalizedLastName,
          surname: normalizedSurname,
          contacts: clientContacts,
        }

        submitBtn.classList.add('accept-btn_load')

        if (btn === 'change') {

          // Серверная валидация
          await changeClientOnServ(client.id, clientObj, errorsMessages);
          if (errorsMessages.length > 0) {

            submitBtn.classList.remove('accept-btn_load')
            createErrorElement(submitBtn, errorsMessages)
          } else {

            formBackground.remove();
            body.classList.remove('stop-scroll')
            window.location.hash = 'ID';
          }
        } else {

          // Серверная валидация
          await pushClientsToServ(clientObj, errorsMessages)
          if (errorsMessages.length > 0) {
            submitBtn.classList.remove('accept-btn_load');
            createErrorElement(submitBtn, errorsMessages);

          } else {

            formBackground.remove();
            body.classList.remove('stop-scroll');
          }
        }
      })
    }

    // Если вызвали попап, через кнопку удалить
    if (btn === 'delete') {

      errorsMessages = [];
      const id = client.id;
      h3.textContent = 'Удалить клиента';
      text.textContent = 'Вы действительно хотите удалить данного клиента?';
      acceptBtn.textContent = 'Удалить';
      text.after(acceptBtn)
      formWrapper.append(cancellBtn)

      body.append(formBackground)
      body.classList.add('stop-scroll');
      acceptBtn.addEventListener('click', async () => {
        acceptBtn.classList.add('accept-btn_load');

        try {
          await deleteClientFromServ(id);
          document.getElementById(id).remove();
          formBackground.remove();
          body.classList.remove('stop-scroll');
        } catch (error) {
          errorsMessages.push('Не удалось подключиться к серверу');
          createErrorElement(acceptBtn, errorsMessages);
          acceptBtn.classList.remove('accept-btn_load');
        }

      })


    } else if (btn === 'change') {
      createChangeAndAddForm()

    } else if (btn === 'new') {
      createChangeAndAddForm()


    }

    cancellBtn.addEventListener('click', () => {
      formBackground.remove();
      body.classList.remove('stop-scroll');
      window.location.hash = 'ID';
    });

    closeBtn.addEventListener('click', () => {
      formBackground.remove();
      body.classList.remove('stop-scroll')
      window.location.hash = 'ID';
    });
    formBackground.addEventListener("click", (event) => {
      const target = event.target;

      // Проверяем, был ли клик выполнен внутри формы
      if (target !== formWrapper && !formWrapper.contains(target)) {
        // Клик вне формы, скрываем форму
        formBackground.remove();
        body.classList.remove('stop-scroll')
      }
    });
    return {
      formBackground, formWrapper, h3, acceptBtn, closeBtn, cancellBtn, text
    }
  }


  // Функция рендера клиента в таблицу
  function renderClient(client) {
    const tr = document.createElement('tr'),
      tdId = document.createElement('td'),
      spanId = document.createElement('span'),
      tdFio = document.createElement('td'),
      tdCreatedDate = document.createElement('td'),
      spanCreatedDate = document.createElement('span'),
      tdUpdatedDate = document.createElement('td'),
      spanUpdatedDate = document.createElement('span'),
      tdContacts = document.createElement('td'),
      tdBtns = document.createElement('td'),
      deleteBtn = document.createElement('button'),
      changeBtn = document.createElement('button');

    if (client.contacts.length !== 0) {
      const contactsArr = [...client.contacts],
        firstFiveContacts = contactsArr.slice(0, 4),
        lastContacts = contactsArr.slice(4, 10);

      // Проверяем наличие контактов и подбираем аттрибуты для <a>
      function createContact(arr) {
        arr.forEach(contact => {
          const a = document.createElement('a');

          if (contact.type === 'Телефон' || contact.type === 'Доп. Телефон') {
            a.classList.add('table__link', 'table__link_tel');
            const phoneSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
            <circle cx="8" cy="8" r="8" fill="inherit"/>
            <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
            </g> </svg>`;
            a.innerHTML = phoneSvg;
            tippy(a, {
              allowHTML: true,
              interactive: true,
              content: `${contact.type}: <a class="table__tippy-link" href="tel:${contact.value}"> ${contact.value} </a>`,
            });
          } else if (contact.type === 'VK') {
            a.classList.add('table__link', 'table__link_vk')
            const vkSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
            <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z"/>
            </g> </svg>`;
            a.innerHTML = vkSvg
            tippy(a, {
              allowHTML: true,
              interactive: true,
              content: `${contact.type}: <a class="table__tippy-link" href="${contact.value}"> ${contact.value} </a>`,
            });

          } else if (contact.type === 'Facebook') {
            a.classList.add('table__link', 'table__link_fb');
            const fbSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
            <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z"/>
            </g> </svg>`;
            a.innerHTML = fbSvg
            tippy(a, {
              allowHTML: true,
              interactive: true,
              content: `${contact.type}: <a class="table__tippy-link" href="${contact.value}"> ${contact.value} </a>`,
            });

          } else if (contact.type === 'Email') {
            a.classList.add('table__link', 'table__link_mail')
            const mailSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z"/>
            </svg>`;
            a.innerHTML = mailSvg
            tippy(a, {
              allowHTML: true,
              interactive: true,
              content: `${contact.type}: <a class="table__tippy-link" href="mailto:${contact.value}"> ${contact.value} </a>`,
            });

          } else {
            a.classList.add('table__link', 'table__link_other')
            const otherSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z"/>
            </svg>`;
            a.innerHTML = otherSvg
            tippy(a, {
              allowHTML: true,
              interactive: true,
              content: `${contact.type}: <a class="table__tippy-link" href="${contact.value}"> ${contact.value} </a>`,
            });
          }

          tdContacts.append(a)
        })
      }

      // Прячем контакты в таблице, если их количество больше 5
      createContact(firstFiveContacts)

      if (lastContacts.length !== 0) {
        const openContacts = document.createElement('button'),
          span = document.createElement('span');
        span.classList.add('contacts-btn-span');
        span.textContent = `+${lastContacts.length}`;
        openContacts.classList.add('btn-reset', 'contacts-btn');
        openContacts.append(span);
        tdContacts.append(openContacts);
        openContacts.addEventListener('click', () => {
          createContact(lastContacts);
          tdContacts.classList.add('table__td_contacts-padding');
          openContacts.remove();
        })
      }
    }

    const createdDate = formatDate(client.createdAt),
      updatedDate = formatDate(client.updatedAt);

    spanId.textContent = client.id;
    tdFio.textContent = `${client.surname} ${client.name} ${client.lastName}`;
    tdCreatedDate.textContent = createdDate.fixDate + ' ';
    spanCreatedDate.textContent = createdDate.fixHours;
    tdUpdatedDate.textContent = updatedDate.fixDate + ' ';
    spanUpdatedDate.textContent = updatedDate.fixHours;
    deleteBtn.textContent = 'Удалить';
    changeBtn.textContent = 'Изменить';
    tr.id = `${client.id}`

    tr.classList.add('table__row');
    tdId.classList.add('table__td');
    spanId.classList.add('table__span');
    tdFio.classList.add('table__td', 'table__td_fio');
    tdCreatedDate.classList.add('table__td');
    spanCreatedDate.classList.add('table__span', 'table__span-time');
    tdUpdatedDate.classList.add('table__td');
    spanUpdatedDate.classList.add('table__span', 'table__span-time')
    tdContacts.classList.add('table__td', 'table__td_contacts');
    tdBtns.classList.add('table__td', 'table__td_btns');
    deleteBtn.classList.add('btn-reset', 'table__btn-delete', 'table__btn-actions');
    changeBtn.classList.add('btn-reset', 'table__btn-change', 'table__btn-actions');

    tdId.append(spanId);
    tdCreatedDate.append(spanCreatedDate);
    tdUpdatedDate.append(spanUpdatedDate);
    tdBtns.append(changeBtn, deleteBtn)

    tr.append(tdId, tdFio, tdCreatedDate, tdUpdatedDate, tdContacts, tdBtns)
    tableBody.append(tr);

    // Слушатель на Удаление
    deleteBtn.addEventListener('click', () => {
      createPopup('delete', client)
    })

    // Слушатель на изменение
    changeBtn.addEventListener('click', () => {

      createPopup('change', client)
    })
  };

  // Слушатель на создание формы нового клиента
  document.body.querySelector('.btn-add-client').addEventListener('click', () => {
    createPopup('new')
  })

  // Функция рендера массива клиентов
  function renderList(list) {
    tableBody.innerHTML = '';
    for (client of list) {
      renderClient(client)
    }
  }

  // Функция получения клиентов с сервера
  async function getClientsFromServ() {

    clientsList = [];
    const response = await fetch(`${SERVER_URL}/api/clients`);
    const result = await response.json();

    result.forEach(client => {

      const createdDate = new Date(client.createdAt);
      client.createdAt = createdDate;
      const updatedDate = new Date(client.updatedAt);
      client.updatedAt = updatedDate;
      const fio = client.lastName + client.name + client.surname
      client.fio = fio.toLowerCase()
      clientsList.push(client)

    })

    const promise = new Promise(resolve => {
      renderList(clientsList);
      resolve();
    })

    promise.then(() => {
      if (document.querySelector('.load'))
        document.querySelector('.load').remove();

    })
  };

  // Функция добавления студента на сервер
  async function pushClientsToServ(client, errors = []) {
    try {
      const response = await fetch(`${SERVER_URL}/api/clients`, {
        method: 'POST',
        body: JSON.stringify({
          name: client.name,
          surname: client.surname,
          lastName: client.lastName,
          contacts: client.contacts
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const result = await response.json();

      if (!response.ok) {

        result.errors.forEach(e => {
          errors.push(e.message)
        })

      } else {
        getClientsFromServ();
      }
    } catch (error) {
      errors.push('Не удалось подключиться к серверу')
    }

  };

  // Функция удаления студентов с сервера
  async function deleteClientFromServ(id) {
    const response = await fetch(`${SERVER_URL}/api/clients/${id}`, {
      method: 'DELETE'
    })
  };

  // Функция изменения студентов на сервере
  async function changeClientOnServ(id, { name, surname, lastName, contacts }, errors = []) {
    try {
      const response = await fetch(`${SERVER_URL}/api/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: name,
          surname: surname,
          lastName: lastName,
          contacts: contacts
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const result = await response.json();
      if (!response.ok) {
        result.errors.forEach(e => {
          errors.push(e.message)
        })

      } else {
        getClientsFromServ();
      }
      // Если нет подключения
    } catch (error) {
      errors.push('Не удалось подключиться к серверу')
    }

  };

  // Запускаем приложение
  async function start() {
    // если приложение открылось, а сервер не работает, каждые 10сек будет запускаться попытка подсоединиться
    const tryToStart = setTimeout(() => {
      start()
    }, 10000);

    try {
      await getClientsFromServ();
      clearTimeout(tryToStart)
      document.body.querySelector('.btn-add-client').removeAttribute('disabled');
    } catch (error) {

      const loadDiv = document.querySelector('.load');
      loadDiv.textContent = "Не удалось подключиться к серверу :'(";

      tryToStart();
    }

    // открываем карточку клиента при запуске, если скопировали ссылку
    if (window.location.hash.length === 19) {
      const hash = String(window.location.hash.substring(6));
      clientsList.forEach(e => {
        if (e.id === hash) {
          createPopup('change', e)
        }
      })
    }
  }

  start()

})();
