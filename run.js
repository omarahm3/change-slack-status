require('dotenv').config()
const puppeteer = require('puppeteer')

const DOMAIN_SELECTOR             = '[data-qa="signin_domain_input"]'
const SUBMIT_DOMAIN_SELECTOR      = 'button[type="submit"]'
const EMAIL_SELECTOR              = '[data-qa="login_email"]'
const PASSWORD_SELECTOR           = '[data-qa="login_password"]'
const SIGN_IN_SELECTOR            = '[data-qa="signin_button"]'
const USER_BUTTON_SELECTOR        = '[data-qa="user-button"]'
const MENU_STATUS_BUTTON_SELECTOR = '[data-qa="menu_item_button"]'
const STATUS_SELECTOR             = '.p-ia__main_menu__user__presence'
const CHANNEL_NAME                = process.env.CHANNEL_NAME
const CHANNEL_LINK                = process.env.CHANNEL_LINK
const EMAIL                       = process.env.LOGIN_EMAIL
const PASSWORD                    = process.env.LOGIN_PASSWORD
const ACTIVE_STATUS               = 'Active'

const hrStart = process.hrtime()

const getElementInnerTextBySelector = async (page, selector) => {
  const element = await page.$(selector)
  return await page.evaluate(el => el.textContent, element)
}

const main = async () => {

  const browser = await puppeteer.launch()
  const page    = await browser.newPage()
  await page.goto(CHANNEL_LINK)
  await page.waitForSelector('form', {
    visible: true
  })

  await page.type(DOMAIN_SELECTOR, CHANNEL_NAME)
  await page.click(SUBMIT_DOMAIN_SELECTOR)

  await page.waitForNavigation()

  await page.type(EMAIL_SELECTOR, EMAIL)
  await page.type(PASSWORD_SELECTOR, PASSWORD)
  await page.click(SIGN_IN_SELECTOR)

  await page.waitForNavigation()

  await page.click(USER_BUTTON_SELECTOR)

  await page.waitForSelector(STATUS_SELECTOR)

  await page.waitForTimeout(1000)

  const status = await getElementInnerTextBySelector(page, STATUS_SELECTOR)

  // Only change status if its not active
  if (status !== ACTIVE_STATUS) {
    console.log(`Status is ${status}, changing`)
    await page.click(MENU_STATUS_BUTTON_SELECTOR)
    
    await page.waitForTimeout(1000)
  } else {
    console.log('Status is already active, ignored')
  }

  browser.close()
  const hrend = process.hrtime(hrStart)
  console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
}

main()