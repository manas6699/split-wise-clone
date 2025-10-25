
const express = require('express');
const router = express.Router();

const authRoutes = require('../routes/auth');

const protectedRoute = require('../routes/protectedRoute');
const addExpenseHandler = require('../routes/expenses.routes');
const allUserList = require('../routes/userlist.routes');
const groupRoutes = require('../routes/group.routes');
const checkexgr = require('../routes/checkexGr.routes');
const pdfRoutes = require('../routes/pdf.routes');

const postProject = require('../routes/projects.routes');
const getLeadRoute = require('../routes/getLead.routes');

const userRolesRoutes = require('../routes/userRoles.routes');
const assignRoutes = require('../routes/assign.routes');

const reassignRoutes = require('../routes/reassign.routes');

const getOldLeads = require("../routes/enquiry.routes")

const CampaignRoute = require('../routes/campaign.routes')

const scheduleRoutes = require('../routes/schedule.routes');

const postProjectNames = require('../routes/projectName.routes')
const locationNames = require('../routes/location.routes')

const sourceNames = require('../routes/sourceName.routes')

const bulkLeadUpload = require('../routes/bulkLeadUpload.routes')

const automateMetaWebhookRoutes = require('../routes/metaIntegration.routes');

router.use('/automate', automateMetaWebhookRoutes);

router.use('/auth', authRoutes);

router.use('/users', userRolesRoutes);

router.use('/admin' , assignRoutes);
router.use('/admin' , reassignRoutes);

router.use('/protected', protectedRoute);

router.use('/create' , CampaignRoute);

router.use('/expense', addExpenseHandler);

router.use('/show', allUserList);

router.use('/group', groupRoutes);

router.use('/check', checkexgr);
router.use('/pdf' , pdfRoutes);


router.use('/mmr', getLeadRoute);
router.use('/mmr', postProject);

router.use('/calender', scheduleRoutes);
router.use('/admin' , getOldLeads);

router.use('/post/addproject' , postProjectNames);

router.use('/locations' , locationNames);

router.use('/sources' , sourceNames);
router.use('/upload' , bulkLeadUpload);


module.exports = router;

