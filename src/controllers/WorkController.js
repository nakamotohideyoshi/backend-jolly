/**
 * Unit controller class, in charge of transactions related to user's units.
 */
const mongodb = require('mongodb');
const AWS = require('aws-sdk');
const fileType = require('file-type');
const dateFns = require('date-fns');
const EntityWork = require('../entities/EntityWork'),
	DbNames = require('../enum/DbNames');


class WorkController {

	/**
     * Controller constructor method.
	 * @returns {WorkController|*}
	 */
	constructor () {

		if ( !WorkController.instance ) {

			WorkController.instance = this;
		}

		return WorkController.instance;
	}

	/**
     * Returns default database.
	 * @returns {Db}
	 */
	getDefaultDB () {

		let Database = JOLLY.service.Db,
			databaseName = DbNames.DB;

		return Database.database(databaseName);
	}

	/**
	 * create new work.
	 * @param {Object} options
	 * @returns {Promise<Object>}
	 */
	async addWork (options) {
    AWS.config.update({ accessKeyId: JOLLY.config.AWS.ACCESS_KEY_ID, secretAccessKey: JOLLY.config.AWS.SECRET_ACCESS_KEY });
    try {
      const S3 = new AWS.S3();
      const {title, role, from, to, caption, pinToProfile, photos, user} = options;
      const fromString = dateFns.format(new Date(from), 'YYYYMMDD');
      const toString = dateFns.format(new Date(to), 'YYYYMMDD');
      const slug = `${title.toLowerCase().split(' ').join('-')}-${fromString}-${toString}`;
      let { coworkers } = options;
      let newWork;

      let photo_urls = [];

      for (let i = 0; i < photos.length; i += 1) {
        const block = photos[i].split(';');
        const [, base64] = block;
        const [, realData] = base64.split(',');

        const fileBuffer = Buffer.from(realData, 'base64');
        const fileTypeInfo = fileType(fileBuffer);
        const fileName = Math.floor(new Date() / 1000);

        const filePath = `${fileName}.${fileTypeInfo.ext}`;
        const params = {
          Bucket: JOLLY.config.S3.BUCKET,
          Key: filePath,
          Body: fileBuffer,
          ACL: 'public-read',
          ContentEncoding: 'base64',
          ContentType: fileTypeInfo.mime,
        };
        await S3.putObject(params).promise();
        photo_urls.push(`${JOLLY.config.S3.BUCKET_LINK}/${filePath}`);
      }

      coworkers = coworkers.map(c => c.id);

      newWork = new EntityWork({
        title,
        role,
        from,
        to,
        caption,
        pinToProfile,
        coworkers,
        photos: photo_urls,
        slug,
        user,
      });

      const workData = await this.saveWork(newWork);
      return workData.toJson({});

    } catch (err) {
      throw new ApiError(err.message);
    }
	}

	listUnits(cb) {

		let Database = JOLLY.service.Db;

		Database.query(DbNames.DB, 'units', (userUnitList) => {

			let itemList = [];

			if (userUnitList) {

				userUnitList.forEach((unitData) => {

					let unitObject = new EntityUnit(unitData);

					itemList.push(unitObject.toJson({}));
				})

			}

			cb(itemList);
		});
  }

  getUserWorks(userId) {
    let db = this.getDefaultDB();
    return new Promise((resolve, reject) => {

      db
        .collection('works')
        .find({
          user: new mongodb.ObjectID(userId),
        })
        .toArray((err, result) => {
          if (err) reject(err);
          let itemList = [];

          if (result) {

            result.forEach((workData) => {

              let workObject = new EntityWork(workData);

              itemList.push(workObject.toJson({}));
            })

          }

          resolve (itemList);
        });
    });
  }

  findWorkById (id) {

		let db = this.getDefaultDB(),
			work = null;
		return new Promise((resolve, reject) => {

			db.collection('works').findOne({
				_id: new mongodb.ObjectID(id),
			}).then((data) => {

				if (data) {

					work = new EntityWork(data);
				}

				resolve (work);

			}).catch(reject);

		});
	}
	/**
	 * Save work into database.
	 * @param {EntityWork} work - work entity we are going to register into system.
	 * @returns {Promise}
	 * @resolve {EntityWork}
	 */
	saveWork (work) {

		let db = this.getDefaultDB(),
			collectionName = 'works',
			workData = work.toJson(),
			workEntity;

		if (workData.id == null) {
			delete (workData.id);
		}

		return new Promise((resolve, reject) => {

			db.collection(collectionName)
				.insertOne(workData)
				.then((result) => {
					//talentData.id = result.insertedId;
					workEntity = new EntityWork(workData);
					resolve(workEntity);
				})
				.catch(reject);

			});
  }

  updateUnit(id, data) {
    let db = this.getDefaultDB(),
      collectionName = 'units',
      unit = null;;

		return new Promise((resolve, reject) => {

			db.collection(collectionName)
				.updateOne({_id: new mongodb.ObjectID(id)}, { $set: data })
				.then((result) => {
          return db.collection('units').findOne({
            _id: new mongodb.ObjectID(id),
          });
        })
        .then((data) => {

          if (data) {

            unit = new EntityUnit(data);
          }

          resolve (unit);

        })
				.catch(reject);

			});
  }

  deleteUnit(id) {
    let db = this.getDefaultDB(),
      collectionName = 'units';

		return new Promise((resolve, reject) => {

			db.collection(collectionName)
				.deleteOne({_id: new mongodb.ObjectID(id)})
				.then(() => {
          resolve();
        })
				.catch(reject);

			});
  }
}

module.exports = WorkController;
