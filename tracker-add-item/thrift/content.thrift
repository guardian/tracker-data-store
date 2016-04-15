/** date times are reprsented as i64 - epoch millis */
typedef i64 DateTime

/**
* This struct represents the bundle of identifiers that content can be
* looked up by.
**/
struct Identifiers {

    /** the url path the content lives on */
    1: required string path;

    /** The page id of the content page that hosts this content */
    2: required i64 pageId;

    /** The story bundle id for that represents this content in incopy
    * This is only set if the content has been sent to or from incopy
    */
    3: optional string storyBundleId;

    /** The id for that represents this content in the fingerpost wires system
    * This is only set if the content has been sent from wires
    */
    4: optional string fingerpostId;

    /** The short path for this content, derived from the page id
    */
    5: optional string shortPath;

}

/**
* this stucture represents the composer user
*/
struct User {

    1: required string email;

    2: optional string firstName;

    3: optional string lastName;
}

/**
* Content types supported by flexible content
*/
enum ContentType {
    ARTICLE = 0,
    LIVEBLOG = 1,
    GALLERY = 2,
    INTERACTIVE = 3,
    PICTURE = 4,
    VIDEO = 5,
    AUDIO = 6,
    CROSSWORD = 7
}

/**
* A record of a change, reocrds when and who performed the change
*/
struct ChangeRecord {

    /** when the change occured */
    1: required DateTime date;

    /** the user that performed the change */
    2: optional User user;
}

/**
* Audit information anbout changes to content
*/
struct ContentChangeDetails {

    /** the latest change to the content */
    1: optional ChangeRecord lastModified;

    /** the content creation event */
    2: optional ChangeRecord created;

    /** the content publication event */
    3: optional ChangeRecord published;

    /**
     * the last major revision to the content, this will update web publication dates
     * and cause content to move to the top of chronological lists. This gets updated
     * when significant changes are made to content, liveblog blocks are launched or
     * when we need to give a little seo bump.
     */
    4: optional ChangeRecord lastMajorRevisionPublished;

    /**
     * the revision number of the content.
     *
     * This value is incremented whenever content is written to the database and can be used to
     * ensure message ordering.
     */
    5: optional i64 revision;

}

/**
* Represents a section.
*
* All tags exist within a section and the content's section is derived from the section of the most
* important tag.
*/
struct Section {

    /** The id of the section. This is derived from the R2 section id */
    1: required i64 id;

    /** The section's name */
    2: optional string name;

    /**
    * The path fragment implied by the section.
    *
    * content paths include {section.pathPrefix}/{tag.slug}/{date}/{content.slug}
    */
    3: optional string pathPrefix;

    /** The url slug used when refering to the section */
    4: optional string slug;
}

/**
* Represents a tag applied to content
*
* The id is the only required field, all the rest of the data can be looked up using the id.
*/
struct Tag {

    /** The id of the tag. This is the R2 id and can be used to look up the tag in the tagApi etc. */
    1: required i64 id;

    /** The tag's type */
    2: optional string type; // TODO make this a enum?

    /** The internal name of the tag */
    3: optional string internalName;

    /** The external name of the tag */
    4: optional string externalName;

    /** The path fragment associated with the tag */
    5: optional string slug;

    /** The section the tag belongs to */
    6: optional Section section;

    /** The full path of the tag */
    7: optional string path;
}

/**
* Represents a Tag's application to content.
*
* Includes the Tag and if the tag <-> content relationship is marked as lead
*/
struct TagUsage {

    /** The tag applied to content */
    1: required Tag tag;

    /** true if the content is lead for this tag */
    2: required bool isLead = false;
}

/** The supported Element types, the types inform what fields to expect and how the Element renders as HTML */
enum ElementType {
    /** A bog standard text element */
    TEXT = 0,
    /** An element with an image, will have Assets */
    IMAGE = 1,
    /** Generic embed Element */
    EMBED = 2,
    /** an element containing a formstack form */
    FORM = 3,
    /** An element containing a text to be treeated a pull quote */
    PULLQUOTE = 4,
    /** An element containing a javascript interactive (although actual interactivity varies) */
    INTERACTIVE = 5,
    /** An embeded comment from discussion */
    COMMENT = 6,
    /** A rich link to guardian content - presents a nice trail outside of the contnet body */
    RICH_LINK = 7,
    /** A table */
    TABLE = 8,
    /** A video element, will contain Assets */
    VIDEO = 9,
    /** A tweet element */
    TWEET = 10,
    /** An embedded piece of witness UGC */
    WITNESS = 11,
    /** An element containing computer codez, this is syntax highlighted. This is used almost exclusively for the developer blog and dogfooding composer */
    CODE = 12,
    /** An audi embed, typically via embedly */
    AUDIO = 13,
    /** A map element, embedded via embedly */
    MAP = 14,
    /** A document element, ebedded via embedly */
    DOCUMENT = 15,
    /** A Guardian Membership event */
    MEMBERSHIP = 16,
    /** content atom embed */
    CONTENTATOM = 17
}

/**
* The fields that configure the Element.
**/
struct ElementFields {
    // TODO document all the element fields
    /** The alt text */
    1: optional string alt;

    /** The api url for linked guardian content */
    2: optional string apiUrl;

    3: optional string attribution;

    4: optional string authorGuardianProfileUrl;

    5: optional string authorName;

    6: optional string authorUrl;

    7: optional string authorUsername;

    8: optional string authorWitnessProfileUrl;

    9: optional string blockAds;

    10: optional string caption;

    /** the text of a comment element */
    11: optional string comment;

    /** the discussion id for an embedded comment */
    12: optional string commentId;

    /** the permalink url of an embedeed comment */
    13: optional string commentUrl;

    14: optional string copyright;

    15: optional string dateCreated;

    16: optional string description;

    17: optional string discussionKey;

    18: optional string discussionUrl;

    19: optional string displayCredit;

    /** duration of a video */
    20: optional string duration;

    /** R2 page id of linked guardian content */
    21: optional string guardianPageId;

    /** height of video / image */
    22: optional i32 height;

    /** hides media on a tweet */
    23: optional bool hideMedia;

    /** hides thread on tweet */
    24: optional bool hideThread;

    /** The html of a text block */
    25: optional string html;

    26: optional string id;

    27: optional string iframeUrl;

    28: optional string imageType;

    29: optional string language;

    30: optional string linkPrefix;

    31: optional string linkText;

    /** url of image picked from the media api */
    32: optional string mediaApiUri;

    /** the id of an image picked from the media api */
    33: optional string mediaId;

    34: optional string originalUrl;

    /** the photographer of an image */
    35: optional string photographer;

    /** the picdar id for an image from picdar */
    36: optional string picdarUrn;

    37: optional string role;

    38: optional string safeEmbedCode;

    39: optional string scriptName;

    40: optional string scriptUrl;

    41: optional string shortUrl;

    42: optional string signedOutAltText;

    43: optional string source;

    44: optional string sourceUrl;

    /** original suppliers id of picked image */
    45: optional string suppliersReference;

    46: optional string tableUrl;

    /** text */
    47: optional string text;

    48: optional string title;

    49: optional string url;

    50: optional string viewKey;

    /** width of embed in element */
    51: optional i32 width;

    /** type of UGC embedded from witness */
    52: optional string witnessEmbedType;

    53: optional string youtubeAuthorName;

    54: optional string youtubeDescription;

    55: optional string youtubeHtml;

    56: optional string youtubeSource;

    57: optional string youtubeTitle;

    58: optional string youtubeUrl;

    59: optional string contentAuthSystem;

    /* START - fields related to Membership events */
    60: optional string venue;

    61: optional string location;

    62: optional string identifier;

    63: optional string price;

    64: optional string image;

    65: optional DateTime start;


    67: optional string embeddable;

    68: optional string stillImageUrl;

    69: optional string thumbnailUrl;

    /* for content atom elements */
    70: optional string atomType;
}

/** Supported asset types */
enum AssetType {
    IMAGE = 0,
    VIDEO = 1,
    AUDIO = 2
}

/** The metadata relating to a particular Asset */
struct AssetFields {

    /** The aspect ratio of the asset*/
    1: optional string aspectRatio;

    /** Alt text */
    2: optional string guardianAltText;

    /** Turns off inline adverts in a guardian video */
    3: optional bool guardianBlockAds;

    /** The caption */
    4: optional string guardianCaption;

    /** The credit to be shown with the asset */
    5: optional string guardianCredit;

    /** The embed code for the Asset (used for video) */
    6: optional string guardianEmbeddable;

    /** The photographer*/
    7: optional string guardianPhotographer;

    /** The source */
    8: optional string guardianSource;

    /** The still image used to represent a video */
    9: optional string guardianStillImageUrl;

    /** The height of the asset */
    10: optional i32 height;

    /** The name of this usage of the asset (e.g thumbnail) */
    11: optional string name;

    /** The https url for the asset */
    12: optional string secureFile;

    /** The width of the asset */
    13: optional i32 width;

    /** Is this image a master asset? */
    14: optional bool isMaster;

    /** Will be present on audio assets.*/
    15: optional i64 sizeInBytes;
}

/** The metadata relating to a text element */
struct TextElementFields {

    /** The html of the text element */
    1: optional string html;
}

/** The metadata relating to a video element */
struct VideoElementFields {

    /** The url of the video */
    1: optional string url;

    /** The description of the video */
    2: optional string description;

    /** The title of the video */
    3: optional string title;

    /** The html for the video */
    4: optional string html;

    5: optional string source;

    6: optional string credit;

    7: optional string caption;

    8: optional i32 width;

    9: optional i32 height;

    10: optional i32 duration;

    11: optional string contentAuthSystem;

    12: optional string mediaId;

    /** Not a bool, because I think that despite the boolean-sounding name it can actually contain arbitrary string values */
    13: optional string embeddable;

    14: optional bool blockAds;

    15: optional string stillImageUrl;

    16: optional string thumbnailImageUrl;

    17: optional string shortUrl;

    18: optional string role;

    /** This is used for e.g. Instagram video embeds */
    19: optional string originalUrl;

    20: optional string guardianHoldingImageSource;

    21: optional string guardianHoldingImagePhotographer;

    22: optional string guardianHoldingImagePicdarUrn;

    23: optional string guardianHoldingImageCopyright;

    24: optional string guardianHoldingImageSuppliersReference;
}

/** The metadata relating to an audio element */
struct AudioElementFields {

    /** The html for the audio */
    1: optional string html;

    /** The description of the audio */
    2: optional string description;

    /** The source of the audio */
    3: optional string source;

    /** The title for the audio */
    4: optional string title;

    /** The credit for the audio */
    5: optional string credit;

    /** The caption for the audio */
    6: optional string caption;

    /** The authorName for the audio. This is used for the credit in e.g. Soundcloud embeds */
    7: optional string authorName;

    /** The original URL of the audio. This is present in e.g. Soundcloud embeds */
    8: optional string originalUrl;

    /** The height of the audio widget. This is present in e.g. Soundcloud embeds */
    9: optional i32 height;

    /** The width of the audio widget. This is present in e.g. Soundcloud embeds */
    10: optional i32 width;

    /** The duration for guardian audio */
    11: optional i32 durationMinutes;
    12: optional i32 durationSeconds;

    /** Content advisory for guardian audio */
    13: optional bool clean;
    14: optional bool explicit;

    /** The id of the audio in the media api */
    15: optional string mediaId;
}

/** The metadata relating to a pull quote element */
struct PullquoteElementFields {

    /** The html for the pull quote */
    1: optional string html;

    /** The attribution for the pull quote */
    2: optional string attribution;
}

/** The metadata relating to a tweet element */
struct TweetElementFields {

    /** The source of the tweet */
    1: optional string source;

    /** The url of the tweet */
    2: optional string url;

    /** The id of the tweet element */
    3: optional string id;

    /** Corresponding html to tweet element */
    4: optional string html;

    /** Original url of tweet */
    5: optional string originalUrl;

    /** The role of the tweet (i.e. a hint about how it should be displayed) */
    6: optional string role;
}

/** The metadata relating to a image element.
 *  Fun fact: this is EXACTLY the same as ImageFields except the fields are in a different order.
 */
struct ImageElementFields {

    /** Caption of the image */
    1: optional string caption;

    /** Copyright for the image */
    2: optional string copyright;

    /** Display credit for the image */
    3: optional bool displayCredit;

    /** Source of the image */
    4: optional string source;

    /** Caption of the image */
    5: optional string photographer;

    /** Alt text of the image */
    6: optional string alt;

    /** Media id of the image */
    7: optional string mediaId;

    /** Media api uri for the image */
    8: optional string mediaApiUri;

    /** picdarUrn of the image */
    9: optional string picdarUrn;

    /** Suppliers reference of the image */
    10: optional string suppliersReference;

    /** Type of the image */
    11: optional string imageType;

    /** Credit for the image */
    12: optional string credit;

    /** The role of the image (i.e. a hint about how it should be displayed) */
    13: optional string role;

    /** Any editorial notes about the image */
    14: optional string comment;
}

/** The metadata relating to an interactive element */
struct InteractiveElementFields {

    1: optional string url;

    2: optional string originalUrl;

    3: optional string source;

    4: optional string caption;

    5: optional string alt;

    6: optional string scriptUrl;

    7: optional string html;

    8: optional string scriptName;

    9: optional string iframeUrl;

    10: optional string role;
}

/** The metadata relating to a map, document or table element */
struct StandardElementFields {

    1: optional string url;

    2: optional string originalUrl;

    3: optional string source;

    4: optional string title;

    5: optional string description;

    /** This is called authorName in the Flex model */
    6: optional string credit;

    7: optional string caption;

    8: optional i32 width;

    9: optional i32 height;

    10: optional string html;

    /** The role of the element (i.e. a hint about how it should be displayed) */
    11: optional string role;
}

/** The metadata relating to a Witness element */
struct WitnessElementFields {

    1: optional string url;

    2: optional string originalUrl;

    /** "text" or "image" or "video" */
    3: optional string witnessEmbedType;

    /** e.g. https://witness.theguardian.com/assignment/55c071d5e4b0412eb1bfe040/1672183 */
    4: optional string mediaId;

    /** "Guardian Witness" */
    5: optional string source;

    6: optional string title;

    7: optional string description;

    8: optional string authorName;

    9: optional string authorUsername;

    /** e.g. "https://witness.theguardian.com/user/JuliaHamilton" */
    10: optional string authorWitnessProfileUrl;

    11: optional string authorGuardianProfileUrl;

    12: optional string caption;

    13: optional string alt;

    14: optional i32 width;

    15: optional i32 height;

    16: optional string html;

    /** The n0tice API URL, e.g. "https://n0ticeapis.com/2/report/1669406" */
    17: optional string apiUrl;

    18: optional string photographer;

    19: optional DateTime dateCreated;

    20: optional string youtubeUrl;

    21: optional string youtubeSource;

    22: optional string youtubeTitle;

    23: optional string youtubeDescription;

    24: optional string youtubeAuthorName;

    25: optional string youtubeHtml;

    /** The role of the Witness element (i.e. a hint about how it should be displayed) */
    26: optional string role;
}

/** The metadata relating to a rich-link element */
struct RichLinkElementFields {

    1: optional string url;

    2: optional string originalUrl;

    3: optional string linkText;

    4: optional string linkPrefix;

    /** The role of the rich-link (i.e. a hint about how it should be displayed) */
    5: optional string role;
}

/** The metadata relating to a membership element */
struct MembershipElementFields {

    1: optional string originalUrl;

    2: optional string linkText;

    3: optional string linkPrefix;

    4: optional string title;

    /** e.g. "Emmanuel Centre" */
    5: optional string venue;

    /** e.g. "Marsham Street, London, SW1P 3DW" */
    6: optional string location;

    /** e.g. "guardian-live" */
    7: optional string identifier;

    /** e.g. "https://media.guim.co.uk/f04b6e4e395a1bbd7ad7b13524083ed8b8e0b2d6/0_665_2736_1641/500.jpg" */
    8: optional string image;

    /** e.g. "£25" */
    9: optional string price;

    10: optional DateTime start;
}

struct EmbedElementFields {

    1: optional string html;

    2: optional bool safeEmbedCode;

    3: optional string alt;
}

/** An Asset represents an asset file and relevent metadata.
*
* An image or video will have multiple Assets representing different crops, scalings or qualities.
* The consumer can pick the appropriate Asset to render for their usage and client device size etc.
*/
struct Asset {
    /** The type of the asset */
    1: required AssetType assetType;

    /** The mime type of the asset */
    2: required string mimeType;

    /** The url where the asset file lives */
    3: required string url;

    /** The metadata about the asset */
    4: optional AssetFields fields;
}

/**
* An Element represents a fragment of content, This might be some text, an image, an embed etc.
* By building up a list of Elements a rich content body can be constructed flexibly.
*/
struct Element {
    /** The type of element this represents */
    1: required ElementType elementType;

    /** The fields associated with the Element */
    2: optional ElementFields fields;

    /** The assets associated with this Element */
    3: optional list<Asset> assets;

    /** The text type data associated with this Element */
    4: optional TextElementFields textFields;

    /** The video type data associated with this Element */
    5: optional VideoElementFields videoFields;

    /** The tweet type data associated with this Element */
    6: optional TweetElementFields tweetFields;

    /** The image type data associated with this Element */
    7: optional ImageElementFields imageFields;

    /** The pull quote type data associated with this Element */
    8: optional PullquoteElementFields pullquoteFields;

    /** The audio type data associated with this Element */
    9: optional AudioElementFields audioFields;

    /** The interactive type data associated with this Element */
    10: optional InteractiveElementFields interactiveFields;

    /** The map type data associated with this Element */
    11: optional StandardElementFields mapFields;

    /** The document type data associated with this Element */
    12: optional StandardElementFields documentFields;

    /** The witness type data associated with this Element */
    13: optional WitnessElementFields witnessFields;

    /** The table type data associated with this Element */
    14: optional StandardElementFields tableFields;

    /** The rich-link type data associated with this Element */
    15: optional RichLinkElementFields richLinkFields;

    /** The membership type data associated with this Element */
    16: optional MembershipElementFields membershipFields;

    17: optional EmbedElementFields embedFields;
}

/**
* BlockAttributes are used in liveblogs to mark certain updates as key events or summary blocks
*/
struct BlockAttributes {

    /** Indicates a keyEvent Block */
    1: optional bool keyEvent;

    /** Indicates a summary Block */
    2: optional bool summary;

    /** gives a Block an optional title */
    3: optional string title;

    /** Indicates whether a Block has been pinned or not, false if not present */
    4: optional bool pinned;
}

/**
* The block is the main container of body text for content. Most content is made up of a single
* main media Block and a single body Block, live blogs are made up of multiple body Blocks, each
* Block representing an individual update.
*
* Each Block is individually referencable and publishable. Blocks are made up of a number of sub elements
*/
struct Block {
    /** The Block's id */
    1: required string id;

    /** The Block's attributes, these configure blocks within a liveblog. */
    2: optional BlockAttributes attributes;

    /** The User that created the Block */
    3: optional User createdBy;

    /** When the block was created */
    4: optional DateTime dateCreated;

    /** The Elements that make up the Block */
    5: optional list<Element> elements;

    /** When the Block was first published */
    6: optional DateTime firstPublishedDate;

    /** When the Block was modified */
    7: optional DateTime lastModified;

    /** Who last modified the Block */
    8: optional User lastModifiedBy;

    /** If the Block is currently live, not if this is false and firstPublished is set the Block is taken down */
    9: optional bool published;

    /** The most recent publication date */
    10: optional DateTime publishedDate;

    /** A summary text representation of the block */
    11: optional string bodyTextSummary;

    /** An HTML representation of the block */
    12: optional string bodyHtml;

    /** Contributors of the block */
    13: optional list<Tag> contributors;
}

/** Image metadata, this is a image specific subset of ElementFields.
 *
 * TODO want to get rid of this type because it's exactly the same as ImageElementFields
 * (apart from the order of fields). But this is a breaking change.
 * Will have to wait until v2.
 */
struct ImageFields {

    /** The alt text */
    1: optional string alt;

    /** The image's caption */
    2: optional string caption;

    /** Any editorial notes about the image */
    3: optional string comment;

    /** The copyright information */
    4: optional string copyright;

    /** If the credit should be displayed (not if the caption already includes the credit) */
    5: optional bool displayCredit;

    /** The image type */
    6: optional string imageType;

    /** The url of the media api record of this image */
    7: optional string mediaApiUri;

    /** The id of the image in the media api */
    8: optional string mediaId;

    /** The photographer */
    9: optional string photographer;

    /** The id of the image in the picdar system */
    10: optional string picdarUrn;

    /** ? */
    11: optional string role;

    /** The source of the image */
    12: optional string source;

    /** The id of the image in the original supplier's system */
    13: optional string suppliersReference;

    14: optional string credit;
}

/** A raw image, as opposed to wrapped in an Element with type = IMAGE. This is used for content thumbnails */
struct Image {
    /** The metadata for this Image */
    1: optional ImageFields fields;

    /** The set of crops and scalings for this image */
    2: optional list<Asset> assets;
}

enum MembershipTier {
    MEMBERS_ONLY = 0,
    PAID_MEMBERS_ONLY = 1
}

/**
* ContentFields is a collection of fields for the content. Fields are used to represent the furniture
* of the content that displays with the content or to trail the content.
*
* values stored as fields are typically seen by the end user, in contrast to values stored as settings
*/
struct ContentFields {

    /** The headline, does not contain HTML */
    1: optional string headline;

    /** The url slug for thew content, usually derives from the headline */
    2: optional string slug;

    /** The text used when linking to the content, usually derives from the headline */
    3: optional string linkText;

    /** The standfirst of the content, can contain HTML */
    4: optional string standfirst;

    /** The short text used when promoting the content, can be derived from the standfirst, can contain HTML */
    5: optional string trailText;

    /** the byline for the contributor(s) or agency that wrote the content. Will contain links to contributor pages as HTML */
    6: optional string byline;

    7: optional string main;

    8: optional string body;

    /** The page in the newspaper this content appeared on */
    9: optional i32 newspaperPageNumber;

    /** The date of the newspaper this content appears in (can be in the future if on the web before printing) */
    10: optional DateTime newspaperPublicationDate;

    /** The star rating on a review. will be 0 to 5 */
    11: optional i16 starRating;

    /** The context info about the contributor for this story */
    12: optional string contributorBio;

    /** Indicates what level of membership is needed to view content */
    13: optional MembershipTier membershipAccess;

    /** The number of words in the body text */
    14: optional i32 wordCount;
}


/**
* Offices supported by flexible content
*/
enum Office {
    UK = 0,
    US = 1,
    AUS = 2
}

/**
* ContentSettings is a collection of settings that update how content is displayed and what is shown
* alongside the the content.
*
* values stored as settings are not seen by the end user directly.
*
*/
struct ContentSettings {

// comments
    /** If comments are turned on */
    1: optional bool commentable;

    /** The closing date for comment submissions - NB comments are still visible afterwards */
    2: optional DateTime commentCloseDate;

    /** If comments are premoderated */
    3: optional bool isPremoderated;

// misc
    /** The office that commissioned this contnet */
    4: optional Office productionOffice;

    /** Hints to the frontend how to render the content - photo blog, immersive interactive etc. */
    5: optional string displayHint;      // TODO enum?

    /** Prevents launch before the embargo date */
    6: optional DateTime embargoedUntil;

    /** Prevents launch forever */
    7: optional bool embargoedIndefinitely;

// sensitivity
    /** Turns of automatic sponsorship badging and logos */
    8: optional bool isInappropriateForSponsorship;

    /** Turns off display and inclusion in the automatic related content component */
    9: optional bool relatedContentOff;

    /** Turns of adverts */
    10: optional bool blockAds;

// witness
    /** Indicates that we accept UGC submissions for this content */
    11: optional bool allowUgc;

    /** The witness assignment to submit UGC to*/
    12: optional string witnessAssignmentId;

// live blogging
    /** Is this liveblog currently live */
    13: optional bool liveBloggingNow;

    /** Times on Live blog blocks are shown relative (6 mins ago etc.) */
    14: optional bool relativeTime;

    /** The timezone to use when rendering live blog blocks */
    15: optional string timeZone;

    /** Whether content is considered legally sensitive or not */
    16: optional bool legallySensitive;

    /** Whether content is graphic, violent or sexual */
    17: optional bool sensitive;
}

/**
* Represents where the contant appears in the newspaper
*
* The book is the physical printed thing (G1, G2 etc), the bookSection is the subsection of the
* book (news, business, obituries etc.) and the publication is the physical publication(The Guardian, The Observer).
* This information, along with the newspaperPageNumber and newspaperPublicationDate fields,
* is used to produce the daily newspaper navigation pages.
*/
struct Newspaper {

    /** The book tag represents the physical printed thing (G1, G2 etc) the content appeared in */
    1: required Tag book;

    /** bookSection represents the subsection of the book (news, business, obituries etc.) he content appeared in*/
    2: required Tag bookSection;

    /** publication represents the physical publication the content has been printed in */
    3: required Tag publication;
}

/**
* An external reference applied to content
*
* An external reference typically refers to a thing in another system or a real world thing.
* Examples include the isbn of a book the content is reviewing or a cricket match.
*/
struct Reference {

    /** The external id */
    1: required string id;

    /** The type of reference */
    2: required string type;
}

/**
* Taxonomy represents the tags and references of a piece of content
*/
struct Taxonomy {

    /** The list of tags applied to the content.
    *
    * The tags in this list are all the non contributor, newspaper and publication tags. They
    * are ordered by importance (most important first). Any tag in this list can be marked as 'lead'
    * marking this content as the most important story for the tag at the time of publication.
    */
    1: optional list<TagUsage> tags;

    /** The list of contributor tags for this content.
    *
    * Contributors are managed via the content's byline and links to the contributor tag pages are
    * included in the byline
    */
    2: optional list<Tag> contributors;

    /** The publication that commissioned this content*/
    3: optional Tag publication;

    /** The newspaper book and book section that the content appeared in */
    4: optional Newspaper newspaper;

    /** The external references applied to this content */
    5: optional list<Reference> references
}

/**
* Details of how and if content id expired
*/
struct ExpiryDetails {

    /** true if content is expired */
    1: required bool expired;

    /** when the content was expired */
    2: optional DateTime expiredAt;

    /** when the content is due to expire */
    3: optional DateTime scheduledExpiry;
}

/**
* Expiry represents the ways content can expire
*/
struct Expiry {

    /** details of rights based expiry */
    1: optional ExpiryDetails rights;

    /** details of commercial based expiry */
    2: optional ExpiryDetails commercial;
}

/** the rights profile of a content item */
struct Rights {

    /** true if available in the syndication system */
    1: required bool syndicationAggregate;

    /** true if available in to subscribers ??? */
    2: required bool subscriptionDatabases;

    /** true if available to all users of CAPI */
    3: required bool developerCommunity;
}

enum AtomType { quiz, viewpoints }

struct AtomID {

    1: required string id

    2: required AtomType type

}

/**
* This struct represents the content item
*/
struct Content {

    /** The content's id */
    1: required string id;

    /** The bundle of ids the contnet can be referenced by */
    2: required Identifiers identifiers;

    /** The content's type */
    3: required ContentType type;

    /** Indictes if the content is live */
    4: required bool published;

    /** Indictes if the content is gone */
    5: required bool isGone;

    /** Indictes if the content is expired */
    6: required bool isExpired;

    /** The date time (in millis since epoch UTC) at which the content is scheduled to launch */
    7: optional DateTime scheduledLaunchDate;

    /** Audit information about content changes */
    8: optional ContentChangeDetails contentChangeDetails;

    /** The main medai block of the content */
    9: optional Block mainBlock;

    /** The body block of the content */
    10: optional list<Block> blocks;

    /** The users who have collaborated on this content */
    11: optional list<User> collaborators;

    /** The thumbnail url for the content */
    12: optional string thumbnail;

    /** The fields collection for the content */
    13: optional ContentFields fields;

    /** The settings for the content */
    14: optional ContentSettings settings;

    /** The taxonomy for the content */
    15: optional Taxonomy taxonomy;

    /** The secureThumbnail url for the content */
    16: optional string secureThumbnail;

    /** The expiry details for the content */
    17: optional Expiry expiry;

    /** The rights profile for the content */
    18: optional Rights rights;

    /** Complete information about the thumbnail, including assets etc. */
    19: optional Image thumbnailImage;

    /** IDs of any atoms that are embedded in this content **/
    20: optional list<AtomID> atomIds;
}
