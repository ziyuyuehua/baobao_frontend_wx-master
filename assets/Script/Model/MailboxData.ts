
export  class MailboxData  {

    mailbox: Array<mailbox>;
    userID: number;

    setMailbox = ( response: any ) => {

        this.mailbox = response.mailBox;
        this.userID = response.userId;

    }

}


export interface mailbox {
    //附件
    annex: string;//"-2,100;-3,50"
    //是否有附件
    haveAnnex: boolean;//true
    //是否阅读
    read: false;//false
    //接受时间
    receiveTime: number; //1550237169
    //正文
    text: string; //"欢迎来到秋叶原小店！这里将带你进入到一个全新的经营世界！"
    //主题
    theme: string; //"欢迎来到秋叶原小店！"
    //剩余时间
    timeRemaining: number; // 633523
    
    //邮件的唯一ID
    createTime: number; // 633523
}